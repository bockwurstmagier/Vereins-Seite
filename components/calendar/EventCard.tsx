import { CalendarPlus, Clock3, MapPin } from "lucide-react";
import {
  getCategoryStyles,
  getGoogleCalendarUrl,
  type ClubEvent,
} from "../../lib/calendar";

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default function EventCard({ event }: { event: ClubEvent }) {
  const startsAt = new Date(event.starts_at);

  return (
    <article className="club-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider ${getCategoryStyles(event.event_type)}`}
          >
            {event.event_type}
          </span>

          <h2 className="mt-3 text-xl font-black leading-tight text-white">
            {event.title}
          </h2>

          <div className="mt-4 space-y-2 text-sm text-zinc-400">
            <p className="flex items-center gap-2">
              <Clock3 size={16} className="text-club-light-red" aria-hidden="true" />
              <span>
                {dateFormatter.format(startsAt)}
                {!event.all_day && ` · ${timeFormatter.format(startsAt)} Uhr`}
              </span>
            </p>

            {event.location && (
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-club-light-red" aria-hidden="true" />
                <span>{event.location}</span>
              </p>
            )}
          </div>

          {event.description && (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
              {event.description}
            </p>
          )}
        </div>

        <a
          href={getGoogleCalendarUrl(event)}
          target="_blank"
          rel="noreferrer"
          className="club-button-secondary shrink-0"
        >
          <CalendarPlus size={17} aria-hidden="true" />
          Google Kalender
        </a>
      </div>
    </article>
  );
}
