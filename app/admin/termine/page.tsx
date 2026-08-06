import { CalendarDays, CalendarPlus, List, MapPin, Pencil, Trash2 } from "lucide-react";
import CalendarMonth from "../../../components/calendar/CalendarMonth";
import { EVENT_CATEGORIES, type ClubEvent } from "../../../lib/calendar";
import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";
import { createEvent, deleteEvent } from "./actions";

type SearchParams = Promise<{ created?: string; updated?: string; deleted?: string; error?: string; view?: string; month?: string; year?: string }>;

const dateFormatter = new Intl.DateTimeFormat("de-DE", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Berlin" });

export default async function AdminTerminePage({ searchParams }: { searchParams: SearchParams }) {
  await requireRole(["administrator", "vorstand", "trainer"]);
  const params = await searchParams;
  const now = new Date();
  const month = Number(params.month) || now.getMonth() + 1;
  const year = Number(params.year) || now.getFullYear();
  const view = params.view === "month" ? "month" : "list";
  const supabase = await createClient();
  const { data, error } = await supabase.from("club_events").select("*").order("starts_at", { ascending: true });
  const events = (data ?? []) as ClubEvent[];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="club-eyebrow">Vereinsmanager</p>
          <h1 className="club-heading mt-2">Vereinskalender Pro</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Termine anlegen, bearbeiten, filtern und öffentlich anzeigen.</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/termine?view=list" className={view === "list" ? "club-button-primary" : "club-button-secondary"}><List size={17} /> Liste</a>
          <a href={`/admin/termine?view=month&month=${month}&year=${year}`} className={view === "month" ? "club-button-primary" : "club-button-secondary"}><CalendarDays size={17} /> Monat</a>
        </div>
      </div>

      {(params.created || params.updated) && <Notice text="Der Termin wurde erfolgreich gespeichert." />}
      {params.deleted && <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-950/30 p-4 text-sm text-red-300">Der Termin wurde gelöscht.</div>}
      {params.error && (
        <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-950/30 p-4 text-sm leading-6 text-red-200">
          {params.error}
        </div>
      )}

      <section className="club-card mt-8 p-5 sm:p-6">
        <div className="flex items-center gap-3"><div className="club-icon-box"><CalendarPlus size={19} /></div><div><p className="club-eyebrow">Neuer Eintrag</p><h2 className="mt-1 text-xl font-black uppercase">Termin anlegen</h2></div></div>
        <form action={createEvent} className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Titel"><input name="title" required placeholder="z. B. Training 1. Mannschaft" className="admin-input" /></Field>
          <Field label="Kategorie"><select name="event_type" defaultValue="Training" className="admin-input">{EVENT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Startdatum"><input name="date" type="date" required className="admin-input" /></Field>
          <Field label="Startzeit"><input name="time" type="time" required defaultValue="18:30" className="admin-input" /><p className="mt-2 text-xs text-zinc-600">Bei ganztägigen Terminen wird diese Zeit ignoriert.</p></Field>
          <Field label="Enddatum"><input name="end_date" type="date" className="admin-input" /></Field>
          <Field label="Endzeit"><input name="end_time" type="time" className="admin-input" /></Field>
          <Field label="Ort" className="md:col-span-2"><input name="location" placeholder="Adresse oder Treffpunkt" className="admin-input" /></Field>
          <Field label="Beschreibung" className="md:col-span-2"><textarea name="description" rows={4} className="admin-input min-h-28 py-4" /></Field>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4"><input name="all_day" type="checkbox" className="h-5 w-5 accent-red-600" /><span className="text-sm font-bold text-zinc-300">Ganztägig</span></label>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4"><input name="is_public" type="checkbox" defaultChecked className="h-5 w-5 accent-red-600" /><span className="text-sm font-bold text-zinc-300">Öffentlich anzeigen</span></label>
          <button className="club-button-primary md:col-span-2"><CalendarPlus size={18} /> Termin speichern</button>
        </form>
      </section>

      <section className="mt-8">
        {error ? <div className="club-card p-5 text-red-300">{error.message}</div> : view === "month" ? (
          <CalendarMonth events={events} year={year} month={month} basePath="/admin/termine" />
        ) : !events.length ? <div className="club-card p-6 text-zinc-400">Noch keine Termine eingetragen.</div> : (
          <div className="space-y-3">{events.map((event) => <article key={event.id} className="club-card flex items-start justify-between gap-4 p-5"><div className="min-w-0"><p className="club-eyebrow">{event.event_type}{!event.is_public && " · Intern"}</p><h3 className="mt-2 text-xl font-black">{event.title}</h3><p className="mt-2 text-sm text-zinc-400">{dateFormatter.format(new Date(event.starts_at))}</p>{event.location && <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500"><MapPin size={16} />{event.location}</p>}</div><div className="flex gap-2"><a href={`/admin/termine/${event.id}`} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-zinc-300"><Pencil size={18} /></a><form action={deleteEvent}><input type="hidden" name="id" value={event.id} /><button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-950/40 text-red-400"><Trash2 size={18} /></button></form></div></article>)}</div>
        )}
      </section>
    </div>
  );
}

function Notice({ text }: { text: string }) { return <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-950/30 p-4 text-sm text-emerald-300">{text}</div>; }
function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) { return <label className={`block ${className}`}><span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{label}</span>{children}</label>; }
