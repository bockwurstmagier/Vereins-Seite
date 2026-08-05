import "server-only";

import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

type LiveEventType = "goal" | "yellow_card" | "red_card" | "substitution";

type SendLivePushInput = {
  matchId: string;
  eventType: LiveEventType;
  minute: number;
  playerId?: string | null;
  secondaryPlayerId?: string | null;
  description?: string | null;
  homeScore?: number;
  awayScore?: number;
};

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secret) {
    throw new Error(
      "Für Web Push fehlen NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SECRET_KEY.",
    );
  }

  return createClient(url, secret, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function configureWebPush() {
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!subject || !publicKey || !privateKey) {
    throw new Error("Die VAPID-Umgebungsvariablen sind nicht vollständig.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function sendLivePush(input: SendLivePushInput) {
  try {
    configureWebPush();
    const supabase = getAdminClient();

    const [{ data: match }, { data: player }, { data: secondPlayer }] =
      await Promise.all([
        supabase
          .from("matches")
          .select("home_team, away_team, home_score, away_score")
          .eq("id", input.matchId)
          .maybeSingle(),
        input.playerId
          ? supabase
              .from("players")
              .select("first_name, last_name")
              .eq("id", input.playerId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        input.secondaryPlayerId
          ? supabase
              .from("players")
              .select("first_name, last_name")
              .eq("id", input.secondaryPlayerId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

    if (!match) return;

    const preferenceColumn =
      input.eventType === "goal"
        ? "goals_enabled"
        : input.eventType === "substitution"
          ? "substitutions_enabled"
          : "cards_enabled";

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("active", true)
      .eq(preferenceColumn, true);

    if (error || !subscriptions?.length) return;

    const playerName = player
      ? `${player.first_name} ${player.last_name}`
      : null;
    const secondPlayerName = secondPlayer
      ? `${secondPlayer.first_name} ${secondPlayer.last_name}`
      : null;

    const homeScore = input.homeScore ?? match.home_score ?? 0;
    const awayScore = input.awayScore ?? match.away_score ?? 0;
    const scoreLine = `${match.home_team} ${homeScore}:${awayScore} ${match.away_team}`;

    const title =
      input.eventType === "goal"
        ? "⚽ TOOOOR!"
        : input.eventType === "yellow_card"
          ? "🟨 Gelbe Karte"
          : input.eventType === "red_card"
            ? "🟥 Rote Karte"
            : "🔄 Auswechslung";

    const eventDetail =
      input.eventType === "substitution"
        ? `${playerName || "Spieler rein"} für ${secondPlayerName || "Spieler raus"}`
        : playerName || input.description || "Neues Live-Ereignis";

    const payload = JSON.stringify({
      title,
      body: `${input.minute}' · ${eventDetail}\n${scoreLine}`,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      url: `/match-center/${input.matchId}`,
      tag: `match-${input.matchId}-${input.eventType}-${input.minute}`,
      eventType: input.eventType,
      vibrate:
        input.eventType === "goal"
          ? [250, 100, 250, 100, 500]
          : [180, 80, 180],
    });

    const failedIds: string[] = [];

    await Promise.allSettled(
      (subscriptions as PushSubscriptionRow[]).map(async (row) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: row.endpoint,
              keys: {
                p256dh: row.p256dh,
                auth: row.auth,
              },
            },
            payload,
            {
              TTL: 60 * 60,
              urgency: input.eventType === "goal" ? "high" : "normal",
            },
          );
        } catch (error) {
          const statusCode =
            typeof error === "object" &&
            error !== null &&
            "statusCode" in error
              ? Number(error.statusCode)
              : 0;

          if (statusCode === 404 || statusCode === 410) {
            failedIds.push(row.id);
          } else {
            console.error("Push-Nachricht konnte nicht gesendet werden:", error);
          }
        }
      }),
    );

    if (failedIds.length) {
      await supabase
        .from("push_subscriptions")
        .update({ active: false, updated_at: new Date().toISOString() })
        .in("id", failedIds);
    }
  } catch (error) {
    // Ein Push-Fehler darf niemals das Speichern eines Live-Ereignisses verhindern.
    console.error("Web-Push wurde übersprungen:", error);
  }
}


export async function sendFulltimePush(matchId: string) {
  try {
    configureWebPush();
    const supabase = getAdminClient();
    const { data: match } = await supabase
      .from("matches")
      .select("home_team, away_team, home_score, away_score")
      .eq("id", matchId)
      .maybeSingle();

    if (!match) return;

    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("active", true);

    if (!subscriptions?.length) return;

    const payload = JSON.stringify({
      title: "🏁 ABPFIFF",
      body: `${match.home_team} ${match.home_score ?? 0}:${match.away_score ?? 0} ${match.away_team}`,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      url: `/match-center/${matchId}`,
      tag: `match-${matchId}-fulltime`,
      eventType: "fulltime",
      vibrate: [250, 100, 250],
    });

    const failedIds: string[] = [];
    await Promise.allSettled(
      (subscriptions as PushSubscriptionRow[]).map(async (row) => {
        try {
          await webpush.sendNotification(
            { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
            payload,
            { TTL: 60 * 60, urgency: "high" },
          );
        } catch (error) {
          const statusCode = typeof error === "object" && error !== null && "statusCode" in error
            ? Number(error.statusCode)
            : 0;
          if (statusCode === 404 || statusCode === 410) failedIds.push(row.id);
        }
      }),
    );

    if (failedIds.length) {
      await supabase
        .from("push_subscriptions")
        .update({ active: false, updated_at: new Date().toISOString() })
        .in("id", failedIds);
    }
  } catch (error) {
    console.error("Abpfiff-Push wurde übersprungen:", error);
  }
}
