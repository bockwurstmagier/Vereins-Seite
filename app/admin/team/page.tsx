import {
  FilePenLine,
  Plus,
  Shirt,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

import { createClient } from "../../../lib/supabase/server";
import { createPlayer, deletePlayer } from "./actions";

type SearchParams = Promise<{
  created?: string;
  updated?: string;
  deleted?: string;
}>;

export default async function TeamAdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: players, error } = await supabase
    .from("players")
    .select(
      "id, first_name, last_name, slug, squad, shirt_number, position, image_url, image_path, is_active, sort_order",
    )
    .order("squad", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("last_name", { ascending: true });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="club-eyebrow">Vereinsmanager</p>
          <h1 className="club-heading mt-2">Mannschaft verwalten</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Lege Spielerprofile an, lade Fotos hoch und ordne die Spieler einer
            Mannschaft zu.
          </p>
        </div>

        <a href="#new-player" className="club-button-primary">
          <UserPlus size={18} aria-hidden="true" />
          Spieler hinzufügen
        </a>
      </div>

      {params.created && <Notice text="Der Spieler wurde gespeichert." />}
      {params.updated && <Notice text="Der Spieler wurde aktualisiert." />}
      {params.deleted && (
        <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          Der Spieler wurde gelöscht.
        </div>
      )}

      <section id="new-player" className="club-card mt-8 scroll-mt-24 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="club-icon-box">
            <UserPlus size={19} aria-hidden="true" />
          </div>

          <div>
            <p className="club-eyebrow">Neues Profil</p>
            <h2 className="mt-1 text-xl font-black uppercase text-white">
              Spieler anlegen
            </h2>
          </div>
        </div>

        <form action={createPlayer} className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Vorname">
            <input name="first_name" required className="admin-input" />
          </Field>

          <Field label="Nachname">
            <input name="last_name" required className="admin-input" />
          </Field>

          <Field label="Mannschaft">
            <select name="squad" defaultValue="1. Mannschaft" className="admin-input">
              <option>1. Mannschaft</option>
              <option>2. Mannschaft</option>
              <option>Trainer & Staff</option>
            </select>
          </Field>

          <Field label="Position">
            <select name="position" defaultValue="Mittelfeld" className="admin-input">
              <option>Torwart</option>
              <option>Abwehr</option>
              <option>Mittelfeld</option>
              <option>Sturm</option>
              <option>Trainer</option>
              <option>Co-Trainer</option>
              <option>Betreuer</option>
              <option>Vereinsleitung</option>
            </select>
          </Field>

          <Field label="Rückennummer">
            <input
              name="shirt_number"
              type="number"
              min="0"
              max="99"
              className="admin-input"
            />
          </Field>

          <Field label="Sortierung">
            <input
              name="sort_order"
              type="number"
              defaultValue="0"
              className="admin-input"
            />
          </Field>

          <Field label="Starker Fuß">
            <select name="strong_foot" defaultValue="" className="admin-input">
              <option value="">Keine Angabe</option>
              <option>Rechts</option>
              <option>Links</option>
              <option>Beidfüßig</option>
            </select>
          </Field>

          <Field label="Größe in cm">
            <input
              name="height_cm"
              type="number"
              min="120"
              max="230"
              className="admin-input"
            />
          </Field>

          <Field label="Geburtsdatum">
            <input name="birth_date" type="date" className="admin-input" />
          </Field>

          <Field label="Nationalität">
            <input
              name="nationality"
              placeholder="z. B. Deutsch"
              className="admin-input"
            />
          </Field>

          <Field label="Instagram-Link" className="md:col-span-2">
            <input
              name="instagram_url"
              type="url"
              placeholder="https://instagram.com/..."
              className="admin-input"
            />
          </Field>

          <Field label="Kurzprofil" className="md:col-span-2">
            <textarea
              name="short_profile"
              rows={5}
              placeholder="Kurzer Text über den Spieler …"
              className="admin-input min-h-32 py-4"
            />
          </Field>

          <Field label="Lieblingsverein">
            <input name="favorite_club" className="admin-input" />
          </Field>

          <Field label="Lieblingsspieler">
            <input name="favorite_player" className="admin-input" />
          </Field>

          <Field label="Spielerfoto" className="md:col-span-2">
            <input
              name="image"
              type="file"
              accept="image/*"
              className="admin-file-input"
            />
            <p className="mt-2 text-xs text-zinc-600">
              Bilddatei bis maximal 8 MB.
            </p>
          </Field>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 md:col-span-2">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked
              className="h-5 w-5 accent-red-600"
            />
            <span className="text-sm font-bold text-zinc-300">
              Spieler öffentlich anzeigen
            </span>
          </label>

          <div className="md:col-span-2">
            <button type="submit" className="club-button-primary w-full">
              <Plus size={18} aria-hidden="true" />
              Spieler speichern
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="club-icon-box">
            <Users size={19} aria-hidden="true" />
          </div>

          <div>
            <p className="club-eyebrow">Datenbank</p>
            <h2 className="mt-1 text-xl font-black uppercase text-white">
              Spieler und Staff
            </h2>
          </div>
        </div>

        {error ? (
          <div className="club-card p-5 text-sm text-red-300">
            Spieler konnten nicht geladen werden: {error.message}
          </div>
        ) : !players?.length ? (
          <div className="club-card p-6 text-sm text-zinc-400">
            Noch keine Spieler eingetragen.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => (
              <article key={player.id} className="club-card overflow-hidden">
                <div className="relative h-64 bg-gradient-to-br from-club-burgundy to-black">
                  {player.image_url ? (
                    <img
                      src={player.image_url}
                      alt={`${player.first_name} ${player.last_name}`}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Shirt
                        size={58}
                        className="text-club-light-red/45"
                        aria-hidden="true"
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                  {player.shirt_number !== null && (
                    <span className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-club-red text-xl font-black text-white shadow-[0_0_24px_rgba(193,18,31,0.4)]">
                      {player.shirt_number}
                    </span>
                  )}

                  <span
                    className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider ${
                      player.is_active
                        ? "border-emerald-500/20 bg-emerald-950/45 text-emerald-300"
                        : "border-zinc-500/20 bg-black/50 text-zinc-400"
                    }`}
                  >
                    {player.is_active ? "Aktiv" : "Ausgeblendet"}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-club-light-red">
                    {player.squad}
                  </p>

                  <h3 className="mt-2 text-2xl font-black leading-tight text-white">
                    {player.first_name} {player.last_name}
                  </h3>

                  <p className="mt-2 text-sm font-bold text-zinc-500">
                    {player.position}
                  </p>

                  <div className="mt-5 flex gap-2">
                    <a
                      href={`/admin/team/${player.id}`}
                      className="club-button-secondary flex-1"
                    >
                      <FilePenLine size={17} aria-hidden="true" />
                      Bearbeiten
                    </a>

                    <form action={deletePlayer}>
                      <input type="hidden" name="id" value={player.id} />
                      <input
                        type="hidden"
                        name="image_path"
                        value={player.image_path ?? ""}
                      />

                      <button
                        type="submit"
                        aria-label="Spieler löschen"
                        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-950/30 text-red-400 transition hover:bg-red-900/40 active:scale-95"
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
      {text}
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}
