import "server-only";

import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "./supabase/admin";

function requestHost(request: Request) {
  return (request.headers.get("x-forwarded-host") || request.headers.get("host") || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
}

function isSameOrigin(request: Request) {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).host.toLowerCase() === requestHost(request);
  } catch {
    return false;
  }
}

function requestFingerprint(request: Request, action: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const ua = request.headers.get("user-agent") || "unknown";
  const secret = process.env.HUJA_SECURITY_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "huja";
  return createHash("sha256").update(`${secret}|${action}|${ip}|${ua}`).digest("hex");
}

export async function guardPublicMutation(
  request: Request,
  options: { action: string; limit: number; windowSeconds?: number; maxBodyBytes?: number },
) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Anfrage wurde aus Sicherheitsgründen blockiert." }, { status: 403 });
  }

  const maxBodyBytes = options.maxBodyBytes ?? 16_384;
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > maxBodyBytes) {
    return NextResponse.json({ error: "Anfrage ist zu groß." }, { status: 413 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("huja_rate_limit", {
      p_key: requestFingerprint(request, options.action),
      p_limit: options.limit,
      p_window_seconds: options.windowSeconds ?? 60,
    });

    if (error) {
      console.error("HUJA Rate-Limit Check fehlgeschlagen:", error.code);
      return NextResponse.json({ error: "Sicherheitsprüfung ist vorübergehend nicht verfügbar." }, { status: 503 });
    }
    if (!data) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte versuche es gleich erneut." },
        { status: 429, headers: { "Retry-After": String(options.windowSeconds ?? 60) } },
      );
    }
  } catch (error) {
    console.error("HUJA Security Guard fehlgeschlagen:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Sicherheitsprüfung ist vorübergehend nicht verfügbar." }, { status: 503 });
  }

  return null;
}
