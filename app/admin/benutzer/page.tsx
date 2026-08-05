import { Save, ShieldCheck, UserCog } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import {
  APP_ROLES,
  ROLE_LABELS,
  requireRole,
  type AppRole,
} from "../../../lib/auth/roles";
import { updateUserProfile } from "./actions";

type SearchParams = Promise<{ updated?: string }>;

export default async function UsersAdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole(["administrator"]);
  const params = await searchParams;
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("user_profiles")
    .select("id, email, display_name, role, is_active, created_at")
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-3">
        <div className="club-icon-box">
          <UserCog size={20} aria-hidden="true" />
        </div>
        <div>
          <p className="club-eyebrow">Sicherheit</p>
          <h1 className="club-heading mt-1">Benutzer & Rollen</h1>
        </div>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400">
        Neue Benutzer legst du zunächst unter Supabase → Authentication → Users
        an. Danach erscheinen sie automatisch hier und können einer Rolle
        zugewiesen werden.
      </p>

      {params.updated && (
        <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
          Benutzerrolle wurde erfolgreich gespeichert.
        </div>
      )}

      {error ? (
        <div className="club-card mt-8 p-5 text-sm text-red-300">
          Benutzer konnten nicht geladen werden: {error.message}
        </div>
      ) : !profiles?.length ? (
        <div className="club-card mt-8 p-6 text-sm text-zinc-400">
          Noch keine Benutzerprofile vorhanden.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {profiles.map((profile) => (
            <form
              key={profile.id}
              action={updateUserProfile}
              className="club-card p-5"
            >
              <input type="hidden" name="id" value={profile.id} />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-lg font-black text-white">
                    {profile.display_name || profile.email}
                  </p>
                  <p className="mt-1 truncate text-sm text-zinc-500">
                    {profile.email}
                  </p>
                </div>

                <div className="club-icon-box">
                  <ShieldCheck size={18} aria-hidden="true" />
                </div>
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                  Anzeigename
                </span>
                <input
                  name="display_name"
                  defaultValue={profile.display_name ?? ""}
                  className="admin-input"
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                  Rolle
                </span>
                <select
                  name="role"
                  defaultValue={profile.role}
                  className="admin-input"
                >
                  {APP_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role as AppRole]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked={profile.is_active}
                  className="h-5 w-5 accent-red-600"
                />
                <span className="text-sm font-bold text-zinc-300">
                  Zugriff auf den Adminbereich aktiv
                </span>
              </label>

              <button type="submit" className="club-button-primary mt-5 w-full">
                <Save size={17} aria-hidden="true" />
                Benutzer speichern
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
