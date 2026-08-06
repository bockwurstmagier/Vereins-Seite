import {
  BadgeCheck,
  ImageIcon,
  Save,
  Shield,
  Trash2,
} from "lucide-react";

import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";
import { deleteClubLogo, updateClub } from "./actions";

type SearchParams = Promise<{
  updated?: string;
  logoRemoved?: string;
}>;

export default async function ClubsAdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole(["administrator", "vorstand"]);
  const params = await searchParams;
  const supabase = await createClient();

  const { data: clubs, error } = await supabase
    .from("clubs")
    .select(
      "id,name,short_name,logo_url,logo_path,website_url,primary_color,secondary_color,aliases",
    )
    .order("name", { ascending: true });

  const missingLogos = (clubs ?? []).filter((club) => !club.logo_url).length;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-start gap-4">
        <div className="club-icon-box mt-1">
          <Shield size={20} />
        </div>
        <div>
          <p className="club-eyebrow">Zentrale Vereinsdatenbank</p>
          <h1 className="club-heading mt-2">Vereine & Logos</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Alle Mannschaften werden beim DFBnet-Import automatisch angelegt.
            Hinterlege jedes Logo nur einmal – danach erscheint es automatisch
            in Tabelle, Spielplan, nächstem Spiel und Match-Center.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Erkannte Vereine" value={String(clubs?.length ?? 0)} />
        <Stat
          label="Logos vorhanden"
          value={String((clubs?.length ?? 0) - missingLogos)}
        />
        <Stat label="Logos fehlen" value={String(missingLogos)} warning={missingLogos > 0} />
      </div>

      {params.updated && (
        <Notice text="Vereinsdaten wurden gespeichert und überall aktualisiert." />
      )}
      {params.logoRemoved && <Notice text="Das Vereinslogo wurde entfernt." />}

      {error ? (
        <div className="club-card mt-8 p-6 text-sm text-red-300">
          Vereine konnten nicht geladen werden: {error.message}
        </div>
      ) : !clubs?.length ? (
        <div className="club-card mt-8 p-6 text-sm leading-6 text-zinc-400">
          Noch keine Vereine erkannt. Importiere den DFBnet-Spielplan erneut;
          danach erscheinen alle Vereine automatisch hier.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {clubs.map((club) => (
            <article key={club.id} className="club-card overflow-hidden">
              <div className="flex min-h-40 items-center justify-center border-b border-white/10 bg-white p-5">
                {club.logo_url ? (
                  <img
                    src={club.logo_url}
                    alt={`Logo von ${club.name}`}
                    className="max-h-28 max-w-[80%] object-contain"
                  />
                ) : (
                  <div className="text-center text-zinc-400">
                    <ImageIcon className="mx-auto" size={44} />
                    <p className="mt-3 text-xs font-black uppercase tracking-wider">
                      Logo fehlt
                    </p>
                  </div>
                )}
              </div>

              <form
                action={updateClub}
                encType="multipart/form-data"
                className="grid gap-4 p-5 sm:grid-cols-2"
              >
                <input type="hidden" name="id" value={club.id} />
                <input type="hidden" name="old_logo_url" value={club.logo_url ?? ""} />
                <input type="hidden" name="old_logo_path" value={club.logo_path ?? ""} />

                <Field label="Vereinsname" className="sm:col-span-2">
                  <input
                    name="name"
                    defaultValue={club.name}
                    required
                    className="admin-input"
                  />
                </Field>

                <Field label="Kurzname">
                  <input
                    name="short_name"
                    defaultValue={club.short_name ?? ""}
                    placeholder="z. B. ERLE"
                    className="admin-input"
                  />
                </Field>

                <Field label="Website">
                  <input
                    name="website_url"
                    type="url"
                    defaultValue={club.website_url ?? ""}
                    placeholder="https://..."
                    className="admin-input"
                  />
                </Field>

                <Field label="Hauptfarbe">
                  <input
                    name="primary_color"
                    type="color"
                    defaultValue={club.primary_color || "#8f111b"}
                    className="admin-input h-12 p-2"
                  />
                </Field>

                <Field label="Zweitfarbe">
                  <input
                    name="secondary_color"
                    type="color"
                    defaultValue={club.secondary_color || "#111111"}
                    className="admin-input h-12 p-2"
                  />
                </Field>

                <Field label="Logo hochladen" className="sm:col-span-2">
                  <input
                    name="logo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="admin-file-input"
                  />
                </Field>

                <Field label="Namens-Aliase – je Zeile ein Name" className="sm:col-span-2">
                  <textarea
                    name="aliases"
                    rows={3}
                    defaultValue={(club.aliases ?? []).join("\n")}
                    placeholder={"Erle 19\nSSV/FCA Rotthausen"}
                    className="admin-input min-h-24 py-3"
                  />
                </Field>

                <button className="club-button-primary sm:col-span-2">
                  <Save size={17} />
                  Verein speichern
                </button>
              </form>

              {club.logo_url && (
                <form action={deleteClubLogo} className="border-t border-white/10 p-5">
                  <input type="hidden" name="id" value={club.id} />
                  <input type="hidden" name="logo_path" value={club.logo_path ?? ""} />
                  <button className="club-button-secondary w-full text-red-300">
                    <Trash2 size={16} />
                    Logo entfernen
                  </button>
                </form>
              )}
            </article>
          ))}
        </div>
      )}
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
    <label className={className}>
      <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function Stat({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="club-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
          {label}
        </p>
        <BadgeCheck
          size={16}
          className={warning ? "text-amber-400" : "text-emerald-400"}
        />
      </div>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/25 px-4 py-3 text-sm text-emerald-200">
      {text}
    </div>
  );
}
