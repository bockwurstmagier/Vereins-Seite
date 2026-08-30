import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendMatchCountdownPush } from "../../../../lib/push/server";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}` || request.nextUrl.searchParams.get("secret") === secret;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Supabase server config fehlt." }, { status: 500 });

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const now = Date.now();
  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, match_date, status")
    .eq("status", "scheduled")
    .gte("match_date", new Date(now).toISOString())
    .lte("match_date", new Date(now + 25 * 60 * 60 * 1000).toISOString())
    .order("match_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const windows = [
    { stage: "24h" as const, target: 24 * 60, tolerance: 12 },
    { stage: "3h" as const, target: 3 * 60, tolerance: 12 },
    { stage: "30m" as const, target: 30, tolerance: 12 },
  ];

  const sent: Array<{ matchId: string; stage: string }> = [];
  for (const match of matches ?? []) {
    const minutes = (new Date(match.match_date).getTime() - now) / 60000;
    for (const window of windows) {
      if (Math.abs(minutes - window.target) <= window.tolerance) {
        if (await sendMatchCountdownPush(match.id, window.stage)) sent.push({ matchId: match.id, stage: window.stage });
      }
    }
  }
  return NextResponse.json({ ok: true, checked: matches?.length ?? 0, sent });
}
