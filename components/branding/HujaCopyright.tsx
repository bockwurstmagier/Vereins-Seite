import Link from "next/link";

import { HUJA_BRANDING } from "../../lib/branding";

export default function HujaCopyright({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`text-center text-zinc-500 ${className}`}
      aria-label="Copyright und Entwicklerhinweis"
    >
      <p className={compact ? "text-[10px]" : "text-xs"}>
        © {HUJA_BRANDING.copyrightYear} {HUJA_BRANDING.clubName}
      </p>
      <p
        className={`mt-1 font-black uppercase tracking-[0.16em] text-zinc-400 ${
          compact ? "text-[9px]" : "text-[10px]"
        }`}
      >
        Powered by {HUJA_BRANDING.productName} · {HUJA_BRANDING.productSubtitle}
      </p>
      <p className={compact ? "mt-1 text-[9px]" : "mt-1 text-[10px]"}>
        Developed by {HUJA_BRANDING.developer} · {HUJA_BRANDING.rights}
      </p>
      {!compact && (
        <p className="mt-2 text-[10px]">
          <Link href="/ueber-huja" className="transition hover:text-club-light-red">
            Über HUJA
          </Link>
          <span className="mx-2">·</span>
          <Link href="/impressum" className="transition hover:text-club-light-red">
            Impressum
          </Link>
        </p>
      )}
    </div>
  );
}
