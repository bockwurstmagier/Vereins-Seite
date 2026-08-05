import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { getCategoryStyles, getPublicEvents } from "../../lib/calendar";

const formatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default async function UpcomingEvents() {
  const events = await getPublicEvents(3);

  return (
    <section className="club-section py-10">
      <div className="club-container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-club-light-red" aria-hidden="true" />
              <p className="club-eyebrow">Vereinsleben</p>
            </div>
            <h2 className="club-heading mt-2">Nächste Termine</h2>
          </div>

          <a href="/termine" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-club-light-red">
            Alle Termine
            <ChevronRight size={14} />
          </a>
        </div>

        {!events.length ? (
          <div className="club-card p-6 text-sm text-zinc-400">Aktuell sind keine öffentlichen Termine eingetragen.</div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <a key={event.id} href="/termine" className="club-card block p-4 transition hover:border-club-light-red/25">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wider ${getCategoryStyles(event.event_type)}`}>
                      {event.event_type}
                    </span>
                    <h3 className="mt-2 truncate text-base font-black text-white">{event.title}</h3>
                    <p className="mt-2 text-xs text-zinc-500">{formatter.format(new Date(event.starts_at))} Uhr</p>
                    {event.location && (
                      <p className="mt-2 flex items-center gap-1.5 truncate text-xs text-zinc-600">
                        <MapPin size={13} className="text-club-light-red" />
                        {event.location}
                      </p>
                    )}
                  </div>
                  <CalendarDays size={18} className="mt-1 shrink-0 text-club-light-red" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
