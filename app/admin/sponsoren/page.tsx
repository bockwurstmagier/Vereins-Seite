import { ExternalLink, FilePenLine, Handshake, ImageIcon, Plus, Trash2 } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import { createSponsor, deleteSponsor } from "./actions";

type SearchParams = Promise<{ created?: string; updated?: string; deleted?: string }>;

export default async function SponsorsAdminPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: sponsors, error } = await supabase
    .from("sponsors")
    .select("id,name,website_url,category,description,logo_url,logo_path,start_date,end_date,is_active,sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return <div className="mx-auto max-w-7xl">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="club-eyebrow">Vereinsmanager</p><h1 className="club-heading mt-2">Sponsoren verwalten</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Logos, Links, Kategorien und Laufzeiten zentral pflegen.</p></div>
      <a href="#new-sponsor" className="club-button-primary"><Plus size={18}/>Sponsor hinzufügen</a>
    </div>
    {params.created && <Notice text="Sponsor wurde gespeichert."/>}
    {params.updated && <Notice text="Sponsor wurde aktualisiert."/>}
    {params.deleted && <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-950/30 px-4 py-3 text-sm text-red-300">Sponsor wurde gelöscht.</div>}

    <section id="new-sponsor" className="club-card mt-8 scroll-mt-24 p-5 sm:p-6">
      <div className="flex items-center gap-3"><div className="club-icon-box"><Handshake size={19}/></div><div><p className="club-eyebrow">Neuer Partner</p><h2 className="mt-1 text-xl font-black uppercase text-white">Sponsor anlegen</h2></div></div>
      <form action={createSponsor} className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Name"><input name="name" required className="admin-input"/></Field>
        <Field label="Kategorie"><select name="category" defaultValue="Partner" className="admin-input"><option>Premium</option><option>Gold</option><option>Silber</option><option>Partner</option></select></Field>
        <Field label="Website" className="md:col-span-2"><input name="website_url" type="url" placeholder="https://..." className="admin-input"/></Field>
        <Field label="Beschreibung" className="md:col-span-2"><textarea name="description" rows={4} className="admin-input min-h-28 py-4"/></Field>
        <Field label="Startdatum"><input name="start_date" type="date" className="admin-input"/></Field>
        <Field label="Enddatum"><input name="end_date" type="date" className="admin-input"/></Field>
        <Field label="Sortierung"><input name="sort_order" type="number" defaultValue="0" className="admin-input"/></Field>
        <Field label="Logo"><input name="logo" type="file" accept="image/*" className="admin-file-input"/></Field>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 md:col-span-2"><input name="is_active" type="checkbox" defaultChecked className="h-5 w-5 accent-red-600"/><span className="text-sm font-bold text-zinc-300">Sponsor öffentlich anzeigen</span></label>
        <div className="md:col-span-2"><button className="club-button-primary w-full"><Plus size={18}/>Sponsor speichern</button></div>
      </form>
    </section>

    <section className="mt-8">
      <div className="mb-5 flex items-center gap-3"><div className="club-icon-box"><Handshake size={19}/></div><div><p className="club-eyebrow">Datenbank</p><h2 className="mt-1 text-xl font-black uppercase text-white">Vorhandene Sponsoren</h2></div></div>
      {error ? <div className="club-card p-5 text-sm text-red-300">Sponsoren konnten nicht geladen werden: {error.message}</div> : !sponsors?.length ? <div className="club-card p-6 text-sm text-zinc-400">Noch keine Sponsoren eingetragen.</div> :
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{sponsors.map((sponsor) => <article key={sponsor.id} className="club-card overflow-hidden">
        <div className="flex h-44 items-center justify-center bg-white p-6">{sponsor.logo_url ? <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-full max-w-full object-contain"/> : <ImageIcon size={48} className="text-zinc-300"/>}</div>
        <div className="p-5"><div className="flex items-center justify-between gap-3"><p className="club-eyebrow">{sponsor.category}</p><span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${sponsor.is_active ? "bg-emerald-950/40 text-emerald-300" : "bg-zinc-900 text-zinc-500"}`}>{sponsor.is_active ? "Aktiv" : "Ausgeblendet"}</span></div><h3 className="mt-2 text-2xl font-black">{sponsor.name}</h3>
        {sponsor.website_url && <a href={sponsor.website_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase text-club-light-red"><ExternalLink size={14}/>Website</a>}
        <div className="mt-5 flex gap-2"><a href={`/admin/sponsoren/${sponsor.id}`} className="club-button-secondary flex-1"><FilePenLine size={17}/>Bearbeiten</a><form action={deleteSponsor}><input type="hidden" name="id" value={sponsor.id}/><input type="hidden" name="logo_path" value={sponsor.logo_path ?? ""}/><button aria-label="Sponsor löschen" className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/30 text-red-400"><Trash2 size={18}/></button></form></div>
        </div></article>)}</div>}
    </section>
  </div>;
}

function Notice({text}:{text:string}) { return <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">{text}</div>; }
function Field({label,className="",children}:{label:string;className?:string;children:React.ReactNode}) { return <label className={`block ${className}`}><span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{label}</span>{children}</label>; }
