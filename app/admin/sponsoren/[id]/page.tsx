import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { createClient } from "../../../../lib/supabase/server";
import { updateSponsor } from "../actions";

type PageProps = { params: Promise<{ id: string }> };
export default async function EditSponsorPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: sponsor, error } = await supabase.from("sponsors").select("*").eq("id", id).maybeSingle();
  if (error || !sponsor) notFound();
  return <div className="mx-auto max-w-4xl"><a href="/admin/sponsoren" className="inline-flex items-center gap-2 text-xs font-black uppercase text-club-light-red"><ArrowLeft size={16}/>Zurück</a><p className="club-eyebrow mt-8">Sponsorenverwaltung</p><h1 className="club-heading mt-2">Sponsor bearbeiten</h1>
  <form action={updateSponsor} className="club-card mt-8 grid gap-4 p-5 md:grid-cols-2 md:p-6">
    <input type="hidden" name="id" value={sponsor.id}/><input type="hidden" name="old_logo_url" value={sponsor.logo_url ?? ""}/><input type="hidden" name="old_logo_path" value={sponsor.logo_path ?? ""}/>
    <Field label="Name"><input name="name" required defaultValue={sponsor.name} className="admin-input"/></Field>
    <Field label="Kategorie"><select name="category" defaultValue={sponsor.category} className="admin-input"><option>Premium</option><option>Gold</option><option>Silber</option><option>Partner</option></select></Field>
    <Field label="Website" className="md:col-span-2"><input name="website_url" type="url" defaultValue={sponsor.website_url ?? ""} className="admin-input"/></Field>
    <Field label="Beschreibung" className="md:col-span-2"><textarea name="description" rows={5} defaultValue={sponsor.description ?? ""} className="admin-input min-h-32 py-4"/></Field>
    <Field label="Startdatum"><input name="start_date" type="date" defaultValue={sponsor.start_date ?? ""} className="admin-input"/></Field><Field label="Enddatum"><input name="end_date" type="date" defaultValue={sponsor.end_date ?? ""} className="admin-input"/></Field>
    <Field label="Sortierung"><input name="sort_order" type="number" defaultValue={sponsor.sort_order ?? 0} className="admin-input"/></Field><Field label="Neues Logo"><input name="logo" type="file" accept="image/*" className="admin-file-input"/></Field>
    {sponsor.logo_url && <div className="md:col-span-2 flex h-52 items-center justify-center rounded-3xl bg-white p-6"><img src={sponsor.logo_url} alt={sponsor.name} className="max-h-full max-w-full object-contain"/></div>}
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 md:col-span-2"><input name="is_active" type="checkbox" defaultChecked={sponsor.is_active} className="h-5 w-5 accent-red-600"/><span className="text-sm font-bold text-zinc-300">Öffentlich anzeigen</span></label>
    <div className="md:col-span-2"><button className="club-button-primary w-full"><Save size={18}/>Änderungen speichern</button></div>
  </form></div>;
}
function Field({label,className="",children}:{label:string;className?:string;children:React.ReactNode}) { return <label className={`block ${className}`}><span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{label}</span>{children}</label>; }
