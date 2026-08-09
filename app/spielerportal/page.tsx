import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Goal,
  HeartPulse,
  LogOut,
  MessageSquareText,
  ShieldCheck,
  Trophy,
  UserRound,
  PencilLine,
} from "lucide-react";

import vereinsLogo from "../logo.png";
import { logout } from "../login/actions";
import { getPlayerPortalData } from "../../lib/player-portal";
import { createInjuryReport, savePlayerResponse, updateOwnPlayerProfile } from "./actions";

type PageProps = {
  searchParams: Promise<{ saved?: string; injury?: string; profile_saved?: string }>;
};

const formatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default async function PlayerPortalPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const data = await getPlayerPortalData();

  if (!data.player) {
    return (
      <main className="min-h-screen bg-club-black px-4 py-10 text-white">
        <div className="mx-auto max-w-xl">
          <Image src={vereinsLogo} alt="" className="mx-auto w-28" />
          <div className="club-card mt-8 p-6 text-center">
            <UserRound size={42} className="mx-auto text-club-light-red" />
            <h1 className="mt-4 text-2xl font-black uppercase">
              Spielerprofil noch nicht verknüpft
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Ein Administrator muss dein Benutzerkonto einmal mit deinem
              Spielerprofil verbinden.
            </p>
            <form action={logout} className="mt-6">
              <button className="club-button-secondary w-full">
                <LogOut size={16} />
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  const responseMap = new Map(
    data.responses.map((entry) => [
      `${entry.event_type}:${entry.event_id}`,
      entry,
    ]),
  );

  return (
    <main className="min-h-screen bg-club-black px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl pb-24">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image src={vereinsLogo} alt="" className="w-20" />
            <div>
              <p className="club-eyebrow">HUJA Spielerportal</p>
              <h1 className="mt-1 text-2xl font-black uppercase">
                Hallo {data.player.first_name}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {data.player.position}
                {data.player.shirt_number
                  ? ` · Rückennummer ${data.player.shirt_number}`
                  : ""}
              </p>
            </div>
          </div>

          <form action={logout}>
            <button className="club-button-secondary">
              <LogOut size={16} />
              Abmelden
            </button>
          </form>
        </header>

        {params.saved && (
          <Notice text="Deine Rückmeldung wurde gespeichert." />
        )}
        {params.injury && (
          <Notice text="Deine Verletzungsmeldung wurde an das Trainerteam gesendet." />
        )}
        {params.profile_saved && (
          <Notice text="Dein Spielerprofil wurde aktualisiert. Die Änderungen sind auch im Bereich Team sichtbar." />
        )}

        <section className="club-card mt-7 p-5 sm:p-6">
          <SectionTitle icon={<PencilLine size={19} />} title="Mein öffentliches Spielerprofil" />
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Diese Angaben erscheinen auch auf deiner öffentlichen Teamseite. Name, Mannschaft, Rolle und Spielerfoto können nur vom Verein geändert werden.
          </p>

          <form action={updateOwnPlayerProfile} className="mt-6 grid gap-4 md:grid-cols-2">
            <PortalField label="Position">
              <select name="position" defaultValue={data.player.position} className="admin-input">
                <option>Torwart</option>
                <option>Abwehr</option>
                <option>Mittelfeld</option>
                <option>Sturm</option>
              </select>
            </PortalField>

            <PortalField label="Rückennummer">
              <input name="shirt_number" type="number" min="0" max="99" defaultValue={data.player.shirt_number ?? ""} className="admin-input" />
            </PortalField>

            <PortalField label="Starker Fuß">
              <select name="strong_foot" defaultValue={data.player.strong_foot ?? ""} className="admin-input">
                <option value="">Keine Angabe</option>
                <option>Rechts</option>
                <option>Links</option>
                <option>Beidfüßig</option>
              </select>
            </PortalField>

            <PortalField label="Größe in cm">
              <input name="height_cm" type="number" min="120" max="230" defaultValue={data.player.height_cm ?? ""} className="admin-input" />
            </PortalField>

            <PortalField label="Geburtsdatum">
              <input name="birth_date" type="date" defaultValue={data.player.birth_date ?? ""} className="admin-input" />
            </PortalField>

            <PortalField label="Nationalität">
              <input name="nationality" defaultValue={data.player.nationality ?? ""} placeholder="z. B. Deutsch" className="admin-input" />
            </PortalField>

            <PortalField label="Instagram-Link" className="md:col-span-2">
              <input name="instagram_url" type="url" defaultValue={data.player.instagram_url ?? ""} placeholder="https://instagram.com/..." className="admin-input" />
            </PortalField>

            <PortalField label="Kurzprofil" className="md:col-span-2">
              <textarea name="short_profile" rows={4} defaultValue={data.player.short_profile ?? ""} placeholder="Ein paar Worte über dich …" className="admin-input min-h-28 py-4" />
            </PortalField>

            <PortalField label="Lieblingsverein">
              <input name="favorite_club" defaultValue={data.player.favorite_club ?? ""} className="admin-input" />
            </PortalField>

            <PortalField label="Lieblingsspieler">
              <input name="favorite_player" defaultValue={data.player.favorite_player ?? ""} className="admin-input" />
            </PortalField>

            <div className="md:col-span-2">
              <button className="club-button-primary w-full sm:w-auto">
                <PencilLine size={17} />
                Profil speichern
              </button>
            </div>
          </form>
        </section>

        <section className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat icon={<Trophy size={18} />} label="Einsätze" value={data.stats?.appearances ?? 0} />
          <Stat icon={<Goal size={18} />} label="Tore" value={data.stats?.goals ?? 0} />
          <Stat icon={<Activity size={18} />} label="Vorlagen" value={data.stats?.assists ?? 0} />
          <Stat icon={<Clock3 size={18} />} label="Minuten" value={data.stats?.minutes ?? 0} />
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="club-card p-5 sm:p-6">
            <SectionTitle icon={<CalendarDays size={19} />} title="Kommende Spiele" />
            <div className="mt-5 space-y-4">
              {data.matches.length ? (
                data.matches.map((match) => (
                  <EventCard
                    key={match.id}
                    type="match"
                    id={match.id}
                    title={`${match.home_team} – ${match.away_team}`}
                    date={match.match_date}
                    detail={match.location ?? match.competition}
                    existing={responseMap.get(`match:${match.id}`)}
                  />
                ))
              ) : (
                <Empty text="Keine kommenden Spiele vorhanden." />
              )}
            </div>
          </section>

          <section className="club-card p-5 sm:p-6">
            <SectionTitle icon={<Activity size={19} />} title="Kommende Trainings" />
            <div className="mt-5 space-y-4">
              {data.trainings.length ? (
                data.trainings.map((training) => (
                  <EventCard
                    key={training.id}
                    type="training"
                    id={training.id}
                    title={training.title}
                    date={training.session_date}
                    detail={`${training.focus ?? "Training"} · ${training.duration_minutes} Min.`}
                    existing={responseMap.get(`training:${training.id}`)}
                  />
                ))
              ) : (
                <Empty text="Keine kommenden Trainings vorhanden." />
              )}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="club-card p-5 sm:p-6">
            <SectionTitle icon={<Bell size={19} />} title="Nachrichten" />
            <div className="mt-5 space-y-3">
              {data.messages.length ? (
                data.messages.map((message) => (
                  <article
                    key={message.id}
                    className={`rounded-3xl border p-4 ${
                      message.is_important
                        ? "border-club-light-red/30 bg-club-red/10"
                        : "border-white/10 bg-black/25"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquareText size={16} className="text-club-light-red" />
                      <p className="font-black text-white">{message.title}</p>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                      {message.body}
                    </p>
                  </article>
                ))
              ) : (
                <Empty text="Keine neuen Nachrichten." />
              )}
            </div>
          </section>

          <section className="club-card p-5 sm:p-6">
            <SectionTitle icon={<FileText size={19} />} title="Dokumente" />
            <div className="mt-5 space-y-3">
              {data.documents.length ? (
                data.documents.map((document) => (
                  <a
                    key={document.id}
                    href={document.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-3xl border border-white/10 bg-black/25 p-4 transition hover:border-club-light-red/25"
                  >
                    <div className="club-icon-box">
                      <Download size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-white">
                        {document.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {document.description ?? "Dokument öffnen"}
                      </p>
                    </div>
                  </a>
                ))
              ) : (
                <Empty text="Noch keine Dokumente freigegeben." />
              )}
            </div>
          </section>
        </div>

        <section className="club-card mt-6 p-5 sm:p-6">
          <SectionTitle icon={<HeartPulse size={19} />} title="Verletzung oder Ausfall melden" />
          <form action={createInjuryReport} className="mt-5 grid gap-4 sm:grid-cols-2">
            <input
              name="body_area"
              placeholder="Körperbereich, z. B. Oberschenkel"
              className="admin-input"
            />
            <input
              name="available_from"
              type="date"
              className="admin-input"
            />
            <textarea
              name="description"
              required
              placeholder="Beschreibe deine Beschwerden oder den Grund der Abwesenheit."
              className="admin-input min-h-28 py-3 sm:col-span-2"
            />
            <button className="club-button-primary sm:col-span-2">
              <HeartPulse size={17} />
              Meldung absenden
            </button>
          </form>

          {data.injuries.length > 0 && (
            <div className="mt-6">
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                Deine letzten Meldungen
              </p>
              <div className="mt-3 space-y-2">
                {data.injuries.slice(0, 4).map((report) => (
                  <div
                    key={report.id}
                    className="rounded-2xl border border-white/10 bg-black/25 p-3 text-xs text-zinc-400"
                  >
                    <span className="font-black uppercase text-club-light-red">
                      {report.status}
                    </span>
                    {" · "}
                    {report.body_area ? `${report.body_area}: ` : ""}
                    {report.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EventCard({
  type,
  id,
  title,
  date,
  detail,
  existing,
}: {
  type: "training" | "match";
  id: string;
  title: string;
  date: string;
  detail: string;
  existing?: { response: string; note: string | null };
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-black/25 p-4">
      <p className="font-black text-white">{title}</p>
      <p className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
        <Clock3 size={14} className="text-club-light-red" />
        {formatter.format(new Date(date))}
      </p>
      <p className="mt-1 text-xs text-zinc-600">{detail}</p>

      <form action={savePlayerResponse} className="mt-4">
        <input type="hidden" name="event_type" value={type} />
        <input type="hidden" name="event_id" value={id} />
        <div className="grid grid-cols-3 gap-2">
          {[
            ["yes", "Dabei"],
            ["maybe", "Vielleicht"],
            ["no", "Nicht dabei"],
          ].map(([value, label]) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="response"
                value={value}
                defaultChecked={existing?.response === value}
                required
                className="peer sr-only"
              />
              <span className="block rounded-xl border border-white/10 px-2 py-2 text-center text-[10px] font-black uppercase text-zinc-500 transition peer-checked:border-club-light-red/40 peer-checked:bg-club-red/15 peer-checked:text-white">
                {label}
              </span>
            </label>
          ))}
        </div>
        <input
          name="note"
          defaultValue={existing?.note ?? ""}
          placeholder="Optionale Notiz"
          className="admin-input mt-3"
        />
        <button className="club-button-secondary mt-3 w-full text-xs">
          <ShieldCheck size={15} />
          Rückmeldung speichern
        </button>
      </form>
    </article>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <article className="club-card p-5">
      <div className="club-icon-box">{icon}</div>
      <p className="mt-4 text-3xl font-black">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-zinc-500">
        {label}
      </p>
    </article>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="club-icon-box">{icon}</div>
      <h2 className="text-xl font-black uppercase">{title}</h2>
    </div>
  );
}


function PortalField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-950/25 px-4 py-3 text-sm text-emerald-200">
      <CheckCircle2 size={17} />
      {text}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
      {text}
    </div>
  );
}
