"use client";

import { useState } from "react";
import { CheckCircle2, Copy, MessageCircle } from "lucide-react";

export default function InvitationShareButtons({
  registrationUrl,
  whatsappText,
  phoneNumber,
}: {
  registrationUrl: string;
  whatsappText: string;
  phoneNumber: string;
}) {
  const [copied, setCopied] = useState(false);

  const normalizedPhone = phoneNumber.replace(/[^\d]/g, "");
  const whatsappUrl = normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(whatsappText)}`
    : `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  async function copyLink() {
    await navigator.clipboard.writeText(registrationUrl);
    setCopied(true)
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="club-button-primary justify-center"
      >
        <MessageCircle size={17} />
        WhatsApp öffnen
      </a>

      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(registrationUrl);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        }}
        className="club-button-secondary justify-center"
      >
        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
        {copied ? "Link kopiert" : "Link kopieren"}
      </button>
    </div>
  );
}
