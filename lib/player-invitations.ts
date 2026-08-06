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

export function createRegistrationUrl(token: string) {
  const configuredBase =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "";

  if (!configuredBase) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL fehlt. Beispiel: https://vereins-seite-gamma.vercel.app",
    );
  }

  return `${configuredBase}/registrieren/spieler/${token}`;
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
