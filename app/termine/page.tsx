import Link from "next/link";
import { CalendarDays, List } from "lucide-react";
import CalendarMonth from "../../components/calendar/CalendarMonth";
import EventCard from "../../components/calendar/EventCard";
import { EVENT_CATEGORIES, getPublicEvents } from "../../lib/calendar";

export const metadata = { title: "Termine" };

type SearchParams = Promise<{
  view?: string;
  category?: string;
  month?: string;
  year?: string;
}>;

export default async function TerminePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const now = new Date();
  const month = Number(params.month) || now.getMonth() + 1;
  const year = Number(params.year) || now.getFullYear();
  const view = params.view === "list" ? "list" : "month";
  const category = params.category ?? "Alle";
  const events = await getPublicEvents(200);
  const filtered = category === "Alle" ? events : events.filter((event) => event.event_type === category);

  return (
    <main className="min-h-screen bg-club-black px-4 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="club-eyebrow">Zurück zur Startseite</Link>

        <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="club-heading">Vereinskalender</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Spiele, Training, Turniere, Sitzungen und Vereinsveranstaltungen auf einen Blick.
            </p>
          </div>

          <div className="flex gap-2">
            <Link href={`/termine?view=month&month=${month}&year=${year}&category=${encodeURIComponent(category)}`} className={view === "month" ? "club-button-primary" : "club-button-secondary"}>
              <CalendarDays size={17} /> Monatsansicht
            </Link>
            <Link href={`/termine?view=list&category=${encodeURIComponent(category)}`} className={view === "list" ? "club-button-primary" : "club-button-secondary"}>
              <List size={17} /> Liste
            </Link>
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {["Alle", ...EVENT_CATEGORIES].map((item) => (
            <Link
              key={item}
              href={`/termine?view=${view}&month=${month}&year=${year}&category=${encodeURIComponent(item)}`}
              className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-wider transition ${category === item ? "border-club-light-red bg-club-red text-white" : "border-white/10 bg-white/[0.04] text-zinc-500 hover:text-white"}`}
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          {view === "month" ? (
            <CalendarMonth events={filtered} year={year} month={month} />
          ) : filtered.length ? (
            <div className="space-y-4">{filtered.map((event) => <EventCard key={event.id} event={event} />)}</div>
          ) : (
            <div className="club-card p-6 text-zinc-400">Aktuell sind keine passenden Termine eingetragen.</div>
          )}
        </div>
      </div>
    </main>
  );
}
