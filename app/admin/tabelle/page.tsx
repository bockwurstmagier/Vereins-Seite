import { Save, Table2, Trash2 } from "lucide-react";
import { requireRole } from "../../../lib/auth/roles";
import { getStandings } from "../../../lib/sport-center";
import {
  createStanding,
  deleteStanding,
  updateStanding,
} from "./actions";

type SearchParams = Promise<{
  created?: string;
  updated?: string;
  deleted?: string;
}>;

export default async function AdminTablePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const profile = await requireRole(["administrator", "vorstand", "trainer"]);
  const params = await searchParams;
  const rows = await getStandings();
  const canDelete = ["administrator", "vorstand"].includes(profile.role);

  return (
    <div className="mx-auto max-w-7xl">
      <p className="club-eyebrow">Sportzentrum</p>
      <h1 className="club-heading mt-2">Tabelle verwalten</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
        Hier pflegst du die Kreisliga-Tabelle im eigenen Vereinsdesign. Die
        letzten fünf Ergebnisse werden mit W, D und L eingetragen.
      </p>

      {(params.created || params.updated) && (
        <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
          Die Tabelle wurde erfolgreich gespeichert.
        </div>
      )}
      {params.deleted && (
        <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          Die Tabellenzeile wurde gelöscht.
        </div>
      )}

      <section className="club-card mt-8 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="club-icon-box">
            <Table2 size={19} />
          </div>
          <div>
            <p className="club-eyebrow">Neuer Verein</p>
            <h2 className="mt-1 text-xl font-black uppercase">Zeile anlegen</h2>
          </div>
        </div>
        <StandingForm action={createStanding} />
      </section>

      <section className="mt-8 space-y-4">
        {rows.map((row) => (
          <article key={row.id} className="club-card p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="club-eyebrow">Platz {row.position}</p>
                <h2 className="mt-1 text-xl font-black">{row.team_name}</h2>
              </div>
              {canDelete && (
                <form action={deleteStanding}>
                  <input type="hidden" name="id" value={row.id} />
                  <button
                    aria-label="Tabellenzeile löschen"
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/30 text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </form>
              )}
            </div>
            <StandingForm action={updateStanding} row={row} />
          </article>
        ))}
      </section>
    </div>
  );
}

function StandingForm({
  action,
  row,
}: {
  action: (formData: FormData) => Promise<void>;
  row?: Awaited<ReturnType<typeof getStandings>>[number];
}) {
  return (
    <form action={action} className="mt-6 grid gap-4 md:grid-cols-4">
      {row && <input type="hidden" name="id" value={row.id} />}
      <Field label="Saison">
        <input name="season" required defaultValue={row?.season ?? "2026/27"} className="admin-input" />
      </Field>
      <Field label="Wettbewerb">
        <input name="competition" required defaultValue={row?.competition ?? "Kreisliga"} className="admin-input" />
      </Field>
      <Field label="Position">
        <input name="position" type="number" min="1" required defaultValue={row?.position ?? 1} className="admin-input" />
      </Field>
      <Field label="Verein">
        <input name="team_name" required defaultValue={row?.team_name ?? ""} className="admin-input" />
      </Field>
      <NumberField name="played" label="Spiele" value={row?.played} />
      <NumberField name="wins" label="Siege" value={row?.wins} />
      <NumberField name="draws" label="Remis" value={row?.draws} />
      <NumberField name="losses" label="Niederlagen" value={row?.losses} />
      <NumberField name="goals_for" label="Tore" value={row?.goals_for} />
      <NumberField name="goals_against" label="Gegentore" value={row?.goals_against} />
      <NumberField name="points" label="Punkte" value={row?.points} />
      <Field label="Form (W D L)">
        <input name="form" defaultValue={row?.form?.join(" ") ?? ""} placeholder="W W D L W" className="admin-input" />
      </Field>
      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 md:col-span-2">
        <input name="is_club" type="checkbox" defaultChecked={row?.is_club ?? false} className="h-5 w-5 accent-red-600" />
        <span className="text-sm font-bold text-zinc-300">SpVgg Middelich-Resse hervorheben</span>
      </label>
      <button className="club-button-primary md:col-span-2">
        <Save size={18} />
        {row ? "Änderungen speichern" : "Tabellenzeile speichern"}
      </button>
    </form>
  );
}

function NumberField({ name, label, value }: { name: string; label: string; value?: number }) {
  return (
    <Field label={label}>
      <input name={name} type="number" min="0" required defaultValue={value ?? 0} className="admin-input" />
    </Field>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
