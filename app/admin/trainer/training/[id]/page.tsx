import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, Save, Users } from "lucide-react";
import { notFound } from "next/navigation";

import { requireRole } from "../../../../../lib/auth/roles";
import { getTrainingSessionData } from "../../../../../lib/trainer-cockpit";
import { saveAttendance } from "../../actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

const formatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

export default async function TrainingSessionPage({
  params,
  searchParams,
}: PageProps) {
  await requireRole(["administrator", "trainer", "betreuer"]);
  const { id } = await params;
  const { saved } = await searchParams;
  const data = await getTrainingSessionData(id);

  if (!data) notFound();

  const attendanceMap = new Map(
    data.attendance.map((entry) => [entry.player_id, entry]),
  );

  return (
    <div className="mx-auto max-w-5xl pb-24">
      <Link href="/admin/trainer" className="club-button-secondary inline-flex">
        <ArrowLeft size={16} />
        Zurück
      </Link>

      <div className="mt-6">
        <p className="club-eyebrow">Trainingsanwesenheit</p>
        <h1 className="club-heading mt-2">{data.session.title}</h1>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-2">
            <Clock3 size={15} className="text-club-light-red" />
            {formatter.format(new Date(data.session.session_date))}
          </span>
          <span>{data.session.duration_minutes} Minuten</span>
          <span>Intensität {data.session.intensity}/5</span>
          {data.session.focus && <span>Schwerpunkt: {data.session.focus}</span>}
        </div>
      </div>

      {saved && (
        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-950/25 px-4 py-3 text-sm text-emerald-200">
          <CheckCircle2 size={17} />
          Anwesenheit wurde gespeichert.
        </div>
      )}

      <form action={saveAttendance} className="club-card mt-8 overflow-hidden">
        <input type="hidden" name="session_id" value={data.session.id} />

        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="club-icon-box">
              <Users size={19} />
            </div>
            <div>
              <p className="club-eyebrow">Kader</p>
              <h2 className="mt-1 text-xl font-black uppercase text-white">
                Anwesenheit erfassen
              </h2>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/[0.07]">
          {data.players.map((player) => {
            const existing = attendanceMap.get(player.id);
            return (
              <div
                key={player.id}
                className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_12rem_7rem] sm:items-center"
              >
                <input type="hidden" name="player_id" value={player.id} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">
                    {player.first_name} {player.last_name}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {player.position}
                    {player.shirt_number ? ` · Nr. ${player.shirt_number}` : ""}
                  </p>
                </div>

                <select
                  name={`status_${player.id}`}
                  defaultValue={existing?.status ?? "pending"}
                  className="admin-input"
                >
                  <option value="pending">Offen</option>
                  <option value="present">Anwesend</option>
                  <option value="late">Zu spät</option>
                  <option value="excused">Entschuldigt</option>
                  <option value="absent">Unentschuldigt</option>
                  <option value="injured">Verletzt</option>
                </select>

                <input
                  name={`minutes_${player.id}`}
                  type="number"
                  min="0"
                  max={data.session.duration_minutes}
                  defaultValue={existing?.minutes ?? data.session.duration_minutes}
                  className="admin-input"
                  aria-label={`Minuten für ${player.first_name} ${player.last_name}`}
                />

                <input
                  name={`note_${player.id}`}
                  defaultValue={existing?.note ?? ""}
                  placeholder="Notiz"
                  className="admin-input sm:col-span-3"
                />
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/10 p-5">
          <button className="club-button-primary w-full">
            <Save size={17} />
            Anwesenheit speichern
          </button>
        </div>
      </form>
    </div>
  );
}
