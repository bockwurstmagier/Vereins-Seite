import {
  Activity,
  CalendarClock,
  FilePenLine,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";

import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";

type SearchParams = Promise<{
  q?: string;
  type?: string;
}>;

type ActivityLog = {
  id: number;
  user_id: string | null;
  action: "insert" | "update" | "delete";
  entity_type: string;
  entity_id: string | null;
  title: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  email: string;
  display_name: string | null;
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Europe/Berlin",
});

const entityLabels: Record<string, string> = {
  matches: "Spiel",
  news: "News",
  players: "Spieler",
  sponsors: "Sponsor",
  club_events: "Termin",
  contact_requests: "Anfrage",
  match_events: "Spielereignis",
  match_squad: "Aufstellung",
  user_profiles: "Benutzer",
};

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole(["administrator", "vorstand"]);

  const params = await searchParams;
  const queryText = params.q?.trim() ?? "";
  const selectedType = params.type?.trim() ?? "";
  const supabase = await createClient();

  let query = supabase
    .from("activity_logs")
    .select("id, user_id, action, entity_type, entity_id, title, created_at")
    .order("created_at", { ascending: false })
    .limit(150);

  if (selectedType) {
    query = query.eq("entity_type", selectedType);
  }

  if (queryText) {
    query = query.ilike("title", `%${queryText}%`);
  }

  const { data: logs, error } = await query;
  const typedLogs = (logs ?? []) as ActivityLog[];
  const userIds = [...new Set(typedLogs.map((log) => log.user_id).filter(Boolean))] as string[];

  let profiles: Profile[] = [];

  if (userIds.length) {
    const { data } = await supabase
      .from("user_profiles")
      .select("id, email, display_name")
      .in("id", userIds);

    profiles = (data ?? []) as Profile[];
  }

  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <p className="club-eyebrow">Sicherheit & Nachvollziehbarkeit</p>
        <h1 className="club-heading mt-2">Aktivitätsprotokoll</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Hier siehst du, wer Inhalte angelegt, bearbeitet oder gelöscht hat.
          Die Einträge entstehen automatisch durch Datenbank-Trigger.
        </p>
      </div>

      <form className="club-card mt-7 grid gap-3 p-4 sm:grid-cols-[1fr_220px_auto]">
        <label className="relative block">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
            aria-hidden="true"
          />
          <input
            name="q"
            defaultValue={queryText}
            placeholder="Nach Titel oder Namen suchen"
            className="admin-input pl-11"
          />
        </label>

        <select name="type" defaultValue={selectedType} className="admin-input">
          <option value="">Alle Bereiche</option>
          {Object.entries(entityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button type="submit" className="club-button-primary">
          <Search size={17} aria-hidden="true" />
          Filtern
        </button>
      </form>

      {error ? (
        <div className="club-card mt-6 p-5 text-sm text-red-300">
          Das Aktivitätsprotokoll konnte nicht geladen werden: {error.message}
        </div>
      ) : !typedLogs.length ? (
        <div className="club-card mt-6 p-8 text-center text-sm leading-6 text-zinc-500">
          Noch keine passenden Aktivitäten vorhanden. Neue Änderungen werden
          nach der SQL-Installation automatisch protokolliert.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {typedLogs.map((log) => {
            const profile = log.user_id ? profileMap.get(log.user_id) : null;
            const actor = profile?.display_name || profile?.email || "System";
            const config = getActionConfig(log.action);
            const Icon = config.icon;

            return (
              <article key={log.id} className="club-card p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.iconClass}`}>
                    <Icon size={19} aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${config.badgeClass}`}>
                        {config.label}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-500">
                        {entityLabels[log.entity_type] || log.entity_type}
                      </span>
                    </div>

                    <h2 className="mt-3 break-words text-base font-black text-white">
                      {log.title || "Eintrag ohne Titel"}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound size={14} className="text-club-light-red" aria-hidden="true" />
                        {actor}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock size={14} className="text-club-light-red" aria-hidden="true" />
                        {dateFormatter.format(new Date(log.created_at))}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getActionConfig(action: ActivityLog["action"]) {
  if (action === "insert") {
    return {
      label: "Angelegt",
      icon: Plus,
      iconClass: "bg-emerald-500/10 text-emerald-300",
      badgeClass: "border-emerald-500/20 bg-emerald-950/30 text-emerald-300",
    };
  }

  if (action === "delete") {
    return {
      label: "Gelöscht",
      icon: Trash2,
      iconClass: "bg-red-500/10 text-red-300",
      badgeClass: "border-red-500/20 bg-red-950/30 text-red-300",
    };
  }

  return {
    label: "Bearbeitet",
    icon: FilePenLine,
    iconClass: "bg-amber-500/10 text-amber-300",
    badgeClass: "border-amber-500/20 bg-amber-950/30 text-amber-300",
  };
}
