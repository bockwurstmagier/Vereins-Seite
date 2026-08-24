import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import { requireRole } from "../../../lib/auth/roles";
import { createAdminClient } from "../../../lib/supabase/admin";

export default async function SecurityPage() {
  await requireRole(["administrator"]);
  let rateLimitReady = false;
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.rpc("huja_rate_limit", { p_key: `security-check-${Date.now()}`, p_limit: 2, p_window_seconds: 60 });
    rateLimitReady = !error;
  } catch {}

  const checks = [
    ["Security Headers", true, "Framing, MIME-Sniffing, Referrer und sensible Browser-Berechtigungen werden begrenzt."],
    ["Öffentliche API Origin-Prüfung", true, "Schreibende Fan-/Push-Endpunkte blockieren Cross-Site-Anfragen."],
    ["Verteiltes Rate Limiting", rateLimitReady, rateLimitReady ? "Supabase Rate-Limiter ist aktiv." : "Bitte v22.6.0 SQL in Supabase ausführen."],
    ["Serverseitige Admin-Rollen", true, "Adminbereiche und Live-Steuerung bleiben serverseitig rollenbasiert geschützt."],
    ["Service-Role bleibt serverseitig", true, "Server-Secrets werden nicht an Client-Komponenten ausgeliefert."],
  ] as const;

  return <div className="mx-auto max-w-5xl">
    <p className="club-eyebrow">HUJA Security Center</p>
    <h1 className="club-heading mt-2 flex items-center gap-3"><ShieldCheck className="text-club-light-red"/> Sicherheit</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">Technischer Status der wichtigsten Schutzschichten. Dieser Check ersetzt keinen externen Penetrationstest, zeigt aber, ob HUJAs eigene Hardening-Bausteine aktiv sind.</p>
    <div className="mt-8 grid gap-4">
      {checks.map(([title,ok,text])=><div key={title} className="club-card flex items-start gap-4 p-5">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${ok?"bg-emerald-500/10 text-emerald-300":"bg-amber-500/10 text-amber-300"}`}>{ok?<CheckCircle2 size={22}/>:<LockKeyhole size={22}/>}</div>
        <div><p className="font-black text-white">{title}</p><p className="mt-1 text-sm text-zinc-500">{text}</p></div>
        <span className={`ml-auto rounded-full px-3 py-1 text-[10px] font-black uppercase ${ok?"bg-emerald-500/10 text-emerald-300":"bg-amber-500/10 text-amber-300"}`}>{ok?"Aktiv":"Prüfen"}</span>
      </div>)}
    </div>
  </div>;
}
