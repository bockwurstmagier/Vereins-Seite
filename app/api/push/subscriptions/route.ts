import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type SubscriptionBody = {
  deviceToken?: string;
  subscription?: {
    endpoint?: string;
    keys?: {
      p256dh?: string;
      auth?: string;
    };
  };
  preferences?: {
    liveStarts?: boolean;
    news?: boolean;
    goals?: boolean;
    cards?: boolean;
    substitutions?: boolean;
  };
};

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secret) {
    throw new Error("Supabase-Servervariablen fehlen.");
  }

  return createClient(url, secret, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubscriptionBody;
    const endpoint = body.subscription?.endpoint;
    const p256dh = body.subscription?.keys?.p256dh;
    const auth = body.subscription?.keys?.auth;
    const deviceToken = body.deviceToken;

    if (!endpoint || !p256dh || !auth || !deviceToken) {
      return NextResponse.json(
        { error: "Die Push-Subscription ist unvollständig." },
        { status: 400 },
      );
    }

    const preferences = body.preferences ?? {};
    const supabase = adminClient();

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        device_token: deviceToken,
        endpoint,
        p256dh,
        auth,
        user_agent: request.headers.get("user-agent"),
        live_starts_enabled: preferences.liveStarts ?? true,
        news_enabled: preferences.news ?? true,
        goals_enabled: preferences.goals ?? true,
        cards_enabled: preferences.cards ?? true,
        substitutions_enabled: preferences.substitutions ?? true,
        active: true,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Push-Subscription konnte nicht gespeichert werden.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { deviceToken?: string };
    if (!body.deviceToken) {
      return NextResponse.json(
        { error: "Gerätekennung fehlt." },
        { status: 400 },
      );
    }

    const supabase = adminClient();
    const { error } = await supabase
      .from("push_subscriptions")
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("device_token", body.deviceToken);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Push-Subscription konnte nicht deaktiviert werden.",
      },
      { status: 500 },
    );
  }
}
