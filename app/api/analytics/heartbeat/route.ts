import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { hashAnonymousId } from "../../../../lib/fan-experience";

const BLOCKED_PREFIXES = ["/admin", "/login", "/registrieren"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      deviceId?: string;
      path?: string;
      pageView?: boolean;
    };
    const deviceId = String(body.deviceId ?? "").trim();
    const path = String(body.path ?? "/").trim().slice(0, 240) || "/";
    if (deviceId.length < 12 || deviceId.length > 160 || BLOCKED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return NextResponse.json({ ok: true });
    }

    const anonHash = hashAnonymousId(deviceId, "analytics");
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    await supabase.from("app_analytics_sessions").upsert(
      {
        anon_hash: anonHash,
        current_path: path,
        last_seen_at: now,
      },
      { onConflict: "anon_hash" },
    );

    if (body.pageView) {
      await supabase.from("app_analytics_events").insert({
        anon_hash: anonHash,
        event_type: "page_view",
        path,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("HUJA Analytics Heartbeat fehlgeschlagen:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
