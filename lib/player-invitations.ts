import "server-only";

import crypto from "node:crypto";

export function createInvitationToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function normalizePhoneNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  let normalized = trimmed.replace(/[^\d+]/g, "");

  if (normalized.startsWith("00")) {
    normalized = `+${normalized.slice(2)}`;
  }

  if (normalized.startsWith("0")) {
    normalized = `+49${normalized.slice(1)}`;
  }

  return normalized.replace(/[^\d]/g, "");
}

function normalizeOrigin(value?: string | null) {
  if (!value) return undefined;

  const firstValue = value.split(",")[0]?.trim();
  if (!firstValue) return undefined;

  try {
    const url = new URL(firstValue);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return url.origin.replace(/\/+$/, "");
  } catch {
    return undefined;
  }
}

function vercelOrigin() {
  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (!host) return undefined;
  return normalizeOrigin(`https://${host.replace(/^https?:\/\//, "")}`);
}

export function createRegistrationUrl(token: string, requestOrigin?: string) {
  const safeToken = token.trim();
  if (!safeToken) throw new Error("Einladungstoken fehlt.");

  const base =
    normalizeOrigin(requestOrigin) ||
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ||
    vercelOrigin();

  if (!base) {
    throw new Error(
      "Die öffentliche HUJA-Adresse konnte nicht ermittelt werden. NEXT_PUBLIC_SITE_URL setzen.",
    );
  }

  return `${base}/registrieren/spieler/${encodeURIComponent(safeToken)}`;
}

export function createWhatsAppText(input: {
  playerName: string;
  registrationUrl: string;
  expiresAt: string;
}) {
  const expiry = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(input.expiresAt));

  return `🔴⚫ Willkommen bei der SpVgg Middelich-Resse!

Hallo ${input.playerName},

du wurdest für unser HUJA Spielerportal eingeladen.

Über diesen Link kannst du dein Konto erstellen:
${input.registrationUrl}

Der Link ist einmal nutzbar und bis zum ${expiry} gültig.

HUJA – Die Middelicher sind da!`;
}
