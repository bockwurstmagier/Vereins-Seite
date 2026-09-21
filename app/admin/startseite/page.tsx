import { requireRole } from "../../../lib/auth/roles";
import { getHomeModules } from "../../../lib/home-settings";
import { saveHomeModules } from "./actions";

export default async function Page({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireRole(["administrator", "vorstand"]);
  const modules = await getHomeModules();
  const query = await searchParams;
  return <div className="mx-auto max-w-3xl"><h1 className="club-heading">Startseite verwalten</h1>
    <p className="my-5 text-zinc-400">Aktive Bereiche erscheinen auf der Startseite und im ☰ Menü. Kleinere Positionszahlen stehen weiter oben. Pokal und Top Highlights bleiben ohne passende Inhalte ausgeblendet.</p>
    {query.saved && <p role="status" className="my-4 text-emerald-300">Startseite gespeichert.</p>}
    <form action={saveHomeModules} className="club-card space-y-4 p-5">
      {modules.map(module => <div key={module.id} className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <label className="flex min-h-12 items-center gap-3 font-bold text-white"><input type="checkbox" name={`${module.id}_enabled`} defaultChecked={module.enabled} className="h-5 w-5 accent-red-600" />{module.label}</label>
        <label className="w-20 shrink-0 text-xs text-zinc-400">Position<input aria-label={`Position ${module.label}`} name={`${module.id}_order`} type="number" min="0" max="999" required defaultValue={module.order} className="admin-input mt-1 w-full" /></label>
      </div>)}<button className="club-button-primary min-h-12">Änderungen speichern</button>
    </form></div>;
}
