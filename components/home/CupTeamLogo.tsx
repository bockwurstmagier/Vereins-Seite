"use client";
import { useState } from "react";
import { Shield } from "lucide-react";

export default function CupTeamLogo({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="mx-auto flex h-20 w-20 max-w-full items-center justify-center rounded-2xl border border-amber-200/60 bg-white p-2.5 shadow-[0_0_24px_rgba(251,191,36,0.12)] sm:h-24 sm:w-24">
    {src && !failed ? <img src={src} alt={`Wappen von ${name}`} width={76} height={76} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-contain" />
      : <Shield size={40} className="text-amber-700" role="img" aria-label={`Kein Wappen für ${name} verfügbar`} />}
  </div>;
}
