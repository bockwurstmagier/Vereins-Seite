import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCategoryStyles, type ClubEvent } from "../../lib/calendar";

const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(date);
}

export default function CalendarMonth({
  events,
  year,
  month,
  basePath = "/termine",
}: {
  events: ClubEvent[];
  year: number;
  month: number;
  basePath?: string;
}) {
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOffset = (first.getDay() + 6) % 7;
  const previous = new Date(year, month - 2, 1);
  const next = new Date(year, month, 1);
  const monthTitle = new Intl.DateTimeFormat("de-DE", {
    month: "long",
    year: "numeric",
  }).format(first);

  const eventsByDay = new Map<string, ClubEvent[]>();
  for (const event of events) {
    const key = dateKey(new Date(event.starts_at));
    eventsByDay.set(key, [...(eventsByDay.get(key) ?? []), event]);
  }

  const cells: Array<number | null> = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <section className="club-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5">
        <Link
          href={`${basePath}?view=month&month=${previous.getMonth() + 1}&year=${previous.getFullYear()}`}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft size={18} />
        </Link>

        <h2 className="text-lg font-black uppercase text-white">{monthTitle}</h2>

        <Link
          href={`${basePath}?view=month&month=${next.getMonth() + 1}&year=${next.getFullYear()}`}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300"
          aria-label="Nächster Monat"
        >
          <ChevronRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.025]">
        {weekdays.map((day) => (
          <div key={day} className="px-1 py-3 text-center text-[9px] font-black uppercase tracking-wider text-zinc-600">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="min-h-24 border-b border-r border-white/[0.06] bg-black/15" />;
          }

          const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEvents = eventsByDay.get(key) ?? [];
          const today = dateKey(new Date()) === key;

          return (
            <div key={key} className="min-h-24 border-b border-r border-white/[0.06] p-1.5 sm:min-h-32 sm:p-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${today ? "bg-club-red text-white" : "text-zinc-500"}`}>
                {day}
              </span>

              <div className="mt-1.5 space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    title={event.title}
                    className={`truncate rounded-lg border px-1.5 py-1 text-[8px] font-black sm:text-[9px] ${getCategoryStyles(event.event_type)}`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <p className="px-1 text-[8px] font-bold text-zinc-600">+{dayEvents.length - 3} weitere</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
