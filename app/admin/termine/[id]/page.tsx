import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { EVENT_CATEGORIES } from "../../../../lib/calendar";
import { requireRole } from "../../../../lib/auth/roles";
import { createClient } from "../../../../lib/supabase/server";
import { updateEvent } from "../actions";

type PageProps = { params: Promise<{ id: string }> };

function localDate(value: string) {
  return new Intl.DateTimeFormat("sv-SE", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Berlin" }).format(new Date(value));
}
function localTime(value: string) {
  return new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Berlin" }).format(new Date(value));
}

export default async function EditEventPage({ params }: PageProps) {
  await requireRole(["administrator", "vorstand", "trainer"]);
  const { id } = await params;
  const supabase = await createClient();
  const { data: event, error } = await supabase.from("club_events").select("*").eq("id", id).maybeSingle();
  if (error || !event) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <a href="/admin/termine" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-club-light-red"><ArrowLeft size={16} /> Zurück zum Kalender</a>
      <p className="club-eyebrow mt-8">Vereinskalender</p>
      <h1 className="club-heading mt-2">Termin bearbeiten</h1>

      <form action={updateEvent} className="club-card mt-8 grid gap-4 p-5 md:grid-cols-2 md:p-6">
        <input type="hidden" name="id" value={event.id} />
        <Field label="Titel"><input name="title" required defaultValue={event.title} className="admin-input" /></Field>
        <Field label="Kategorie"><select name="event_type" defaultValue={event.event_type} className="admin-input">{EVENT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Startdatum"><input name="date" type="date" required defaultValue={localDate(event.starts_at)} className="admin-input" /></Field>
        <Field label="Startzeit"><input name="time" type="time" defaultValue={event.all_day ? "" : localTime(event.starts_at)} className="admin-input" /></Field>
        <Field label="Enddatum"><input name="end_date" type="date" defaultValue={event.ends_at ? localDate(event.ends_at) : ""} className="admin-input" /></Field>
        <Field label="Endzeit"><input name="end_time" type="time" defaultValue={event.ends_at && !event.all_day ? localTime(event.ends_at) : ""} className="admin-input" /></Field>
        <Field label="Ort" className="md:col-span-2"><input name="location" defaultValue={event.location ?? ""} className="admin-input" /></Field>
        <Field label="Beschreibung" className="md:col-span-2"><textarea name="description" rows={6} defaultValue={event.description ?? ""} className="admin-input min-h-36 py-4" /></Field>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4"><input name="all_day" type="checkbox" defaultChecked={event.all_day} className="h-5 w-5 accent-red-600" /><span className="text-sm font-bold text-zinc-300">Ganztägig</span></label>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4"><input name="is_public" type="checkbox" defaultChecked={event.is_public} className="h-5 w-5 accent-red-600" /><span className="text-sm font-bold text-zinc-300">Öffentlich anzeigen</span></label>
        <button className="club-button-primary md:col-span-2"><Save size={18} /> Änderungen speichern</button>
      </form>
    </div>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) { return <label className={`block ${className}`}><span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{label}</span>{children}</label>; }
