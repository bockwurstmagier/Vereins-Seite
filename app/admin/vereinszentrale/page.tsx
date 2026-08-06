import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  Cake,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Clock3,
  Handshake,
  HeartPulse,
  Radio,
  ShieldCheck,
  Sparkles,
  Table2,
  Trophy,
  Users,
} from "lucide-react";

import { requireRole } from "../../../lib/auth/roles";
import { getClubCommandCenterData } from "../../../lib/club-command-center";

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default async function ClubCommandCenterPage() {
  await requireRole([
    "administrator",
    "vorstand",
    "trainer",
    "social_media",
    "betreuer",
  ]);

  const data = await getClubCommandCenterData();

  return (
    <div className="mx-auto max-w-[1500px] pb-24">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-white/[0.08] bg-gradient-to-br from-club-burgundy/75 via-club-dark-red/35 to-black p-6 shadow-[0_35px_100px_rgba(0,0,0,0.4)] sm:p-8">
        <div className="pointer-events-none absolute right-[-6rem] top-[-8rem] h-72 w-72 rounded-full bg-club-red/25 blur-[90px]" />
        <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-club-light-red/20 bg-club-red/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-club-light-red">
                HUJA Club OS
              </span>
              <span className="rounded-full border border-emerald-500/15 bg-emerald-950/25 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
                Vereinsbetrieb live
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Vereinszentrale
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
              Spielbetrieb, Mannschaft, Training, Termine, Kommunikation und
              Sponsoren auf einer zentralen Seite.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroMetric label="Aktive Spieler" value={data.activePlayers} />
            <HeroMetric label="Offene Punkte" value={data.openTasks} />
            <HeroMetric
              label="Tabellenplatz"
              value={data.clubStanding?.position ?? "–"}
            />
            <HeroMetric label="Training" value={`${data.attendanceRate}%`} />
          </div>
        </div>
      </section>

      {data.liveMatch && (
        <section className="mt-5 rounded-[2rem] border border-red-500/25 bg-gradient-to-r from-red-950/55 via-club-burgundy/45 to-black p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
                <Radio size={24} className="animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300">
                  Live-Spiel
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  {data.liveMatch.home_team}{" "}
                  {data.liveMatch.home_score ?? 0}:
                  {data.liveMatch.away_score ?? 0}{" "}
                  {data.liveMatch.away_team}
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {data.liveMatch.current_minute ?? 0}. Minute
                </p>
              </div>
            </div>
            <Link href="/admin/live" className="club-button-primary">
              LiveCenter öffnen
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      )}

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          icon={<Users size={19} />}
          label="Aktive Spieler"
          value={data.activePlayers}
          detail={`${data.unavailable.length} aktuell eingeschränkt`}
          href="/admin/team"
        />
        <StatusCard
          icon={<HeartPulse size={19} />}
          label="Verfügbarkeit"
          value={Math.max(0, data.activePlayers - data.unavailable.length)}
          detail="Spieler derzeit verfügbar"
          href="/admin/trainer"
        />
        <StatusCard
          icon={<ClipboardCheck size={19} />}
          label="Trainingsquote"
          value={`${data.attendanceRate}%`}
          detail={
            data.attendanceRelevant
              ? `${data.attendanceRelevant} Rückmeldungen ausgewertet`
              : "Noch keine Anwesenheit gepflegt"
          }
          href="/admin/trainer"
        />
        <StatusCard
          icon={<AlertTriangle size={19} />}
          label="Offene Punkte"
          value={data.openTasks}
          detail={`${data.pendingResponses} unsichere Rückmeldungen`}
          href="/admin/spielerportal"
        />
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="club-card p-5 sm:p-6">
          <PanelHeader
            icon={<Trophy size={19} />}
            eyebrow="Spielbetrieb"
            title="Nächstes Spiel"
            href="/admin/spiele"
          />

          {data.nextMatch ? (
            <div className="relative mt-5 overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-br from-club-burgundy/45 via-black/45 to-black/75 p-5 sm:p-7">
              <div className="absolute right-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-club-red/20 blur-3xl" />
              <div className="relative text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-club-light-red">
                  {data.nextMatch.competition}
                </p>
                <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <p className="text-lg font-black leading-tight sm:text-2xl">
                    {data.nextMatch.home_team}
                  </p>
                  <span className="rounded-2xl border border-club-light-red/20 bg-black/35 px-4 py-3 font-black italic text-club-light-red">
                    VS
                  </span>
                  <p className="text-lg font-black leading-tight sm:text-2xl">
                    {data.nextMatch.away_team}
                  </p>
                </div>
                <p className="mt-6 text-xs font-bold text-zinc-400">
                  {dateFormatter.format(
                    new Date(data.nextMatch.match_date),
                  )}{" "}
                  ·{" "}
                  {timeFormatter.format(
                    new Date(data.nextMatch.match_date),
                  )}{" "}
                  Uhr
                </p>
                {data.nextMatch.location && (
                  <p className="mt-2 text-xs text-zinc-600">
                    📍 {data.nextMatch.location}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <Empty text="Aktuell ist kein kommendes Spiel eingetragen." />
          )}
        </section>

        <section className="club-card overflow-hidden">
          <div className="border-b border-white/10 p-5 sm:p-6">
            <PanelHeader
              icon={<Table2 size={19} />}
              eyebrow="Liga"
              title="Tabellenstatus"
              href="/admin/tabelle"
            />
          </div>

          {data.clubStanding ? (
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-[1.75rem] border border-club-light-red/20 bg-club-red/10">
                  <span className="text-4xl font-black text-white">
                    {data.clubStanding.position}.
                  </span>
                  <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-club-light-red">
                    Platz
                  </span>
                </div>
                <div>
                  <p className="text-xl font-black text-white">
                    {data.clubStanding.team_name}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {data.clubStanding.points} Punkte aus{" "}
                    {data.clubStanding.played} Spielen
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    {data.clubStanding.wins} Siege ·{" "}
                    {data.clubStanding.draws} Remis ·{" "}
                    {data.clubStanding.losses} Niederlagen
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-6">
              <Empty text="Für euren Verein wurde noch kein Tabellenplatz erkannt." />
            </div>
          )}
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="club-card p-5 sm:p-6">
          <PanelHeader
            icon={<CalendarClock size={19} />}
            eyebrow="Heute & demnächst"
            title="Vereinstermine"
            href="/admin/termine"
          />
          <div className="mt-5 space-y-3">
            {data.todayEvents.length > 0 && (
              <>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-club-light-red">
                  Heute
                </p>
                {data.todayEvents.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </>
            )}

            {data.upcomingTrainings.map((training) => (
              <EventRow
                key={training.id}
                event={{
                  id: training.id,
                  title: training.title,
                  event_type: "Training",
                  starts_at: training.session_date,
                  location: training.location,
                  is_public: false,
                }}
              />
            ))}

            {data.upcomingEvents.slice(0, 3).map((event) => (
              <EventRow key={event.id} event={event} />
            ))}

            {!data.todayEvents.length &&
              !data.upcomingTrainings.length &&
              !data.upcomingEvents.length && (
                <Empty text="Keine kommenden Termine vorhanden." />
              )}
          </div>
        </section>

        <section className="club-card p-5 sm:p-6">
          <PanelHeader
            icon={<HeartPulse size={19} />}
            eyebrow="Kaderstatus"
            title="Verletzte & nicht verfügbare Spieler"
            href="/admin/trainer"
          />
          <div className="mt-5 space-y-3">
            {data.unavailable.length ? (
              data.unavailable.slice(0, 7).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/20 p-4"
                >
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      entry.status === "injured"
                        ? "bg-red-400"
                        : entry.status === "questionable"
                          ? "bg-amber-400"
                          : "bg-zinc-500"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-white">
                      {entry.playerName}
                    </p>
                    <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                      {availabilityLabel(entry.status)}
                      {entry.reason ? ` · ${entry.reason}` : ""}
                    </p>
                  </div>
                  {entry.end_date && (
                    <span className="text-[10px] text-zinc-600">
                      bis {formatShortDate(entry.end_date)}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-950/20 p-4 text-sm text-emerald-300">
                <CheckCircle2 size={18} />
                Aktuell sind keine Einschränkungen eingetragen.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <section className="club-card p-5 sm:p-6">
          <PanelHeader
            icon={<BellRing size={19} />}
            eyebrow="Kommunikation"
            title="Neue Nachrichten"
            href="/admin/spielerportal"
          />
          <div className="mt-5 space-y-3">
            {data.messages.length ? (
              data.messages.map((message) => (
                <article
                  key={message.id}
                  className={`rounded-2xl border p-4 ${
                    message.is_important
                      ? "border-club-light-red/20 bg-club-red/[0.08]"
                      : "border-white/[0.07] bg-black/20"
                  }`}
                >
                  <p className="font-black text-white">{message.title}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">
                    {message.body}
                  </p>
                </article>
              ))
            ) : (
              <Empty text="In den letzten sieben Tagen gab es keine neuen Nachrichten." />
            )}
          </div>
        </section>

        <section className="club-card p-5 sm:p-6">
          <PanelHeader
            icon={<Cake size={19} />}
            eyebrow="Verein"
            title="Geburtstage"
            href="/admin/team"
          />
          <div className="mt-5 space-y-3">
            {data.birthdays.length ? (
              data.birthdays.slice(0, 6).map((birthday) => (
                <div
                  key={birthday.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/20 p-3"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-club-red/10">
                    {birthday.image_url ? (
                      <img
                        src={birthday.image_url}
                        alt=""
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <Cake size={17} className="text-club-light-red" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-white">
                      {birthday.first_name} {birthday.last_name}
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-600">
                      {birthday.daysUntil === 0
                        ? "Heute"
                        : `in ${birthday.daysUntil} Tagen`}{" "}
                      · wird {birthday.age}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <Empty text="In den nächsten 45 Tagen stehen keine Geburtstage an." />
            )}
          </div>
        </section>

        <section className="club-card p-5 sm:p-6">
          <PanelHeader
            icon={<Handshake size={19} />}
            eyebrow="Partner"
            title="Vertragsfristen"
            href="/admin/sponsoren"
          />
          <div className="mt-5 space-y-3">
            {data.sponsorsExpiring.length ? (
              data.sponsorsExpiring.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="flex items-center gap-3 rounded-2xl border border-amber-500/15 bg-amber-950/15 p-3"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1">
                    {sponsor.logo_url ? (
                      <img
                        src={sponsor.logo_url}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Handshake size={17} className="text-zinc-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-white">
                      {sponsor.name}
                    </p>
                    <p className="mt-1 text-[10px] text-amber-300/70">
                      endet am {formatShortDate(sponsor.end_date)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <Empty text="In den nächsten 60 Tagen läuft kein Sponsoreneintrag aus." />
            )}
          </div>
        </section>
      </div>

      <section className="club-card mt-5 p-5 sm:p-6">
        <PanelHeader
          icon={<Activity size={19} />}
          eyebrow="Form"
          title="Letzte Ergebnisse"
          href="/admin/statistiken"
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {data.recentResults.length ? (
            data.recentResults.map((match) => (
              <article
                key={match.id}
                className={`rounded-2xl border p-4 ${
                  match.outcome === "win"
                    ? "border-emerald-500/15 bg-emerald-950/15"
                    : match.outcome === "draw"
                      ? "border-amber-500/15 bg-amber-950/10"
                      : "border-red-500/15 bg-red-950/10"
                }`}
              >
                <p className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                  {formatShortDate(match.match_date)}
                </p>
                <p className="mt-3 line-clamp-2 min-h-10 text-xs font-black text-white">
                  {match.home_team} – {match.away_team}
                </p>
                <p className="mt-3 text-2xl font-black tabular-nums text-white">
                  {match.home_score ?? 0}:{match.away_score ?? 0}
                </p>
              </article>
            ))
          ) : (
            <div className="sm:col-span-2 xl:col-span-5">
              <Empty text="Noch keine abgeschlossenen Spiele vorhanden." />
            </div>
          )}
        </div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <QuickAction
          href="/admin/live"
          icon={<Radio size={18} />}
          title="LiveCenter"
          text="Spiel steuern"
        />
        <QuickAction
          href="/admin/trainer"
          icon={<ShieldCheck size={18} />}
          title="Trainercockpit"
          text="Kader und Training"
        />
        <QuickAction
          href="/admin/spielerportal"
          icon={<Users size={18} />}
          title="Spielerportal"
          text="Rückmeldungen"
        />
        <QuickAction
          href="/admin/mediencenter"
          icon={<Sparkles size={18} />}
          title="HUJA AI"
          text="Texte erstellen"
        />
        <QuickAction
          href="/admin/autographics"
          icon={<Trophy size={18} />}
          title="AutoGraphics"
          text="Grafiken erstellen"
        />
      </section>
    </div>
  );
}

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-3 backdrop-blur">
      <p className="text-xl font-black tabular-nums text-white">{value}</p>
      <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-zinc-500">
        {label}
      </p>
    </div>
  );
}

function StatusCard({
  icon,
  label,
  value,
  detail,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.75rem] border border-white/[0.07] bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-club-light-red/20"
    >
      <div className="flex items-start justify-between">
        <div className="club-icon-box">{icon}</div>
        <ArrowUpRight
          size={16}
          className="text-zinc-700 transition group-hover:text-club-light-red"
        />
      </div>
      <p className="mt-5 text-3xl font-black tabular-nums text-white">
        {value}
      </p>
      <p className="mt-1 text-xs font-black uppercase tracking-wider text-zinc-300">
        {label}
      </p>
      <p className="mt-2 text-xs text-zinc-600">{detail}</p>
    </Link>
  );
}

function PanelHeader({
  icon,
  eyebrow,
  title,
  href,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="club-icon-box">{icon}</div>
        <div>
          <p className="club-eyebrow">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-black uppercase text-white">
            {title}
          </h2>
        </div>
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-600 transition hover:text-club-light-red"
        >
          Öffnen <ArrowUpRight size={13} />
        </Link>
      )}
    </div>
  );
}

function EventRow({
  event,
}: {
  event: {
    id: string;
    title: string;
    event_type: string;
    starts_at: string;
    location: string | null;
    is_public: boolean;
  };
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/20 p-3">
      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-2xl bg-club-red/10 text-club-light-red">
        <Clock3 size={15} />
        <span className="mt-0.5 text-[9px] font-black">
          {timeFormatter.format(new Date(event.starts_at))}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-white">{event.title}</p>
        <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-wider text-zinc-600">
          {dateFormatter.format(new Date(event.starts_at))}
          {event.location ? ` · ${event.location}` : ""}
        </p>
      </div>
      {!event.is_public && (
        <CircleDot size={13} className="text-amber-400" />
      )}
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 transition hover:border-club-light-red/20"
    >
      <div className="club-icon-box">{icon}</div>
      <div>
        <p className="text-xs font-black uppercase text-white">{title}</p>
        <p className="mt-1 text-[10px] text-zinc-600">{text}</p>
      </div>
      <ArrowUpRight
        size={15}
        className="ml-auto text-zinc-700 transition group-hover:text-club-light-red"
      />
    </Link>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.08] bg-black/15 px-4 py-6 text-center text-sm leading-6 text-zinc-600">
      {text}
    </div>
  );
}

function availabilityLabel(status: string) {
  const labels: Record<string, string> = {
    fit: "Fit",
    questionable: "Fraglich",
    injured: "Verletzt",
    suspended: "Gesperrt",
    unavailable: "Nicht verfügbar",
    rehab: "Reha",
  };

  return labels[status] ?? status;
}

function formatShortDate(value: string | null) {
  if (!value) return "–";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}
