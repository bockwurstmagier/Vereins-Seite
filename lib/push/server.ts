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

type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
  eventType: string;
  vibrate?: number[];
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secret) {
    throw new Error(
      "Für Web Push fehlen NEXT_PUBLIC_SUPABASE_URL sowie SUPABASE_SECRET_KEY oder SUPABASE_SERVICE_ROLE_KEY.",
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

async function claimPushEvent(eventKey: string) {
  const supabase = getAdminClient();

  const { error } = await supabase.from("push_delivery_log").insert({
    event_key: eventKey,
  });

  if (!error) return true;

  // 23505 = unique_violation -> derselbe automatische Push wurde bereits gesendet.
  if (error.code === "23505") return false;

  throw new Error(
    `Push-Deduplizierung konnte nicht geprüft werden: ${error.message}`,
  );
}

async function sendPushToSubscriptions({
  payload,
  preferenceColumn,
  ttl = 60 * 60,
  urgency = "normal",
}: {
  payload: PushPayload;
  preferenceColumn?: string;
  ttl?: number;
  urgency?: "very-low" | "low" | "normal" | "high";
}) {
  configureWebPush();
  const supabase = getAdminClient();

  let query = supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("active", true);

  if (preferenceColumn) {
    query = query.eq(preferenceColumn, true);
  }

  const { data: subscriptions, error } = await query;

  if (error || !subscriptions?.length) return;

  const data = JSON.stringify({
    ...payload,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
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
          data,
          { TTL: ttl, urgency },
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
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .in("id", failedIds);
  }
}

export async function sendMatchLivePush(matchId: string) {
  try {
    const claimed = await claimPushEvent(`match-live:${matchId}`);
    if (!claimed) return;

    const supabase = getAdminClient();
    const { data: match } = await supabase
      .from("matches")
      .select("home_team, away_team")
      .eq("id", matchId)
      .maybeSingle();

    if (!match) return;

    await sendPushToSubscriptions({
      preferenceColumn: "live_starts_enabled",
      urgency: "high",
      payload: {
        title: "🔴 JETZT LIVE!",
        body: `${match.home_team} gegen ${match.away_team} läuft jetzt im HUJA MatchCenter.`,
        url: `/match-center/${matchId}`,
        tag: `match-${matchId}-live`,
        eventType: "match_live",
        vibrate: [220, 90, 220, 90, 350],
      },
    });
  } catch (error) {
    // Push darf niemals den Live-Start verhindern.
    console.error("Live-Start-Push wurde übersprungen:", error);
  }
}

export async function sendNewsPush(newsId: string) {
  try {
    const claimed = await claimPushEvent(`news-published:${newsId}`);
    if (!claimed) return;

    const supabase = getAdminClient();
    const { data: item } = await supabase
      .from("news")
      .select("title, excerpt, slug, status")
      .eq("id", newsId)
      .maybeSingle();

    if (!item || item.status !== "published") return;

    const body =
      item.excerpt?.trim() ||
      "Es gibt neue Vereinsnews bei der SpVgg Middelich-Resse.";

    await sendPushToSubscriptions({
      preferenceColumn: "news_enabled",
      urgency: "normal",
      ttl: 24 * 60 * 60,
      payload: {
        title: "📰 Neue Vereinsnews",
        body: `${item.title} · ${body}`.slice(0, 220),
        url: `/news/${item.slug}`,
        tag: `news-${newsId}`,
        eventType: "news",
        vibrate: [180, 80, 180],
      },
    });
  } catch (error) {
    // Eine Push-Störung darf das Veröffentlichen einer News nicht verhindern.
    console.error("News-Push wurde übersprungen:", error);
  }
}

export async function sendLivePush(input: SendLivePushInput) {
  try {
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

    await sendPushToSubscriptions({
      preferenceColumn,
      urgency: input.eventType === "goal" ? "high" : "normal",
      payload: {
        title,
        body: `${input.minute}' · ${eventDetail}\n${scoreLine}`,
        url: `/match-center/${input.matchId}`,
        tag: `match-${input.matchId}-${input.eventType}-${input.minute}`,
        eventType: input.eventType,
        vibrate:
          input.eventType === "goal"
            ? [250, 100, 250, 100, 500]
            : [180, 80, 180],
      },
    });
  } catch (error) {
    console.error("Web-Push wurde übersprungen:", error);
  }
}

export async function sendFulltimePush(matchId: string) {
  try {
    const supabase = getAdminClient();
    const { data: match } = await supabase
      .from("matches")
      .select("home_team, away_team, home_score, away_score")
      .eq("id", matchId)
      .maybeSingle();

    if (!match) return;

    await sendPushToSubscriptions({
      urgency: "high",
      payload: {
        title: "🏁 ABPFIFF",
        body: `${match.home_team} ${match.home_score ?? 0}:${match.away_score ?? 0} ${match.away_team}`,
        url: `/match-center/${matchId}`,
        tag: `match-${matchId}-fulltime`,
        eventType: "fulltime",
        vibrate: [250, 100, 250],
      },
    });
  } catch (error) {
    console.error("Abpfiff-Push wurde übersprungen:", error);
  }
}
