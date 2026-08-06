import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import DirectPlayerImageUploader from "../../../../components/team/DirectPlayerImageUploader";
import { createClient } from "../../../../lib/supabase/server";
import { updatePlayer } from "../actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPlayerPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !player) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <a
        href="/admin/team"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-club-light-red"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Zurück zur Mannschaft
      </a>

      <p className="club-eyebrow mt-8">Mannschaftsverwaltung</p>
      <h1 className="club-heading mt-2">Spieler bearbeiten</h1>

      <form
        action={updatePlayer}
        className="club-card mt-8 grid gap-4 p-5 md:grid-cols-2 md:p-6"
      >
        <input type="hidden" name="id" value={player.id} />
        <input type="hidden" name="slug" value={player.slug} />
        <input
          type="hidden"
          name="old_image_url"
          value={player.image_url ?? ""}
        />
        <input
          type="hidden"
          name="old_image_path"
          value={player.image_path ?? ""}
        />

        <Field label="Vorname">
          <input
            name="first_name"
            required
            defaultValue={player.first_name}
            className="admin-input"
          />
        </Field>

        <Field label="Nachname">
          <input
            name="last_name"
            required
            defaultValue={player.last_name}
            className="admin-input"
          />
        </Field>

        <Field label="Mannschaft">
          <select
            name="squad"
            defaultValue={player.squad}
            className="admin-input"
          >
            <option>1. Mannschaft</option>
            <option>2. Mannschaft</option>
            <option>Trainer & Staff</option>
          </select>
        </Field>

        <Field label="Position">
          <select
            name="position"
            defaultValue={player.position}
            className="admin-input"
          >
            <option>Torwart</option>
            <option>Abwehr</option>
            <option>Mittelfeld</option>
            <option>Sturm</option>
            <option>Trainer</option>
              <option>Cheftrainer</option>
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
            defaultValue={player.shirt_number ?? ""}
            className="admin-input"
          />
        </Field>

        <Field label="Sortierung">
          <input
            name="sort_order"
            type="number"
            defaultValue={player.sort_order ?? 0}
            className="admin-input"
          />
        </Field>

        <Field label="Starker Fuß">
          <select
            name="strong_foot"
            defaultValue={player.strong_foot ?? ""}
            className="admin-input"
          >
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
            defaultValue={player.height_cm ?? ""}
            className="admin-input"
          />
        </Field>

        <Field label="Geburtsdatum">
          <input
            name="birth_date"
            type="date"
            defaultValue={player.birth_date ?? ""}
            className="admin-input"
          />
        </Field>

        <Field label="Nationalität">
          <input
            name="nationality"
            defaultValue={player.nationality ?? ""}
            className="admin-input"
          />
        </Field>

        <Field label="Instagram-Link" className="md:col-span-2">
          <input
            name="instagram_url"
            type="url"
            defaultValue={player.instagram_url ?? ""}
            className="admin-input"
          />
        </Field>

        <Field label="Kurzprofil" className="md:col-span-2">
          <textarea
            name="short_profile"
            rows={6}
            defaultValue={player.short_profile ?? ""}
            className="admin-input min-h-36 py-4"
          />
        </Field>

        <Field label="Lieblingsverein">
          <input
            name="favorite_club"
            defaultValue={player.favorite_club ?? ""}
            className="admin-input"
          />
        </Field>

        <Field label="Lieblingsspieler">
          <input
            name="favorite_player"
            defaultValue={player.favorite_player ?? ""}
            className="admin-input"
          />
        </Field>

        {player.image_url && (
          <div className="md:col-span-2">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
              Aktuelles Spielerfoto
            </p>
            <img
              src={player.image_url}
              alt={`${player.first_name} ${player.last_name}`}
              className="h-80 w-full rounded-3xl object-cover object-top"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <DirectPlayerImageUploader
            label="Spielerfoto ersetzen"
            initialUrl={player.image_url}
            initialPath={player.image_path}
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 md:col-span-2">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked={player.is_active}
            className="h-5 w-5 accent-red-600"
          />
          <span className="text-sm font-bold text-zinc-300">
            Spieler öffentlich anzeigen
          </span>
        </label>

        <div className="md:col-span-2">
          <button type="submit" className="club-button-primary w-full">
            <Save size={18} aria-hidden="true" />
            Änderungen speichern
          </button>
        </div>
      </form>
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
