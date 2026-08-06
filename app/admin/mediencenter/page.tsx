import {
  Bot,
  BrainCircuit,
  ImageIcon,
  LoaderCircle,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import MediaPackagePanel from "./MediaPackagePanel";
import { generateAiMediaPackage } from "./actions";
import type { MediaCenterPackage } from "../../../lib/ai/media-center";
import { requireRole } from "../../../lib/auth/roles";
import { createClient } from "../../../lib/supabase/server";

type PageProps = {
  searchParams: Promise<{ package?: string; match?: string }>;
};

export default async function AiMediaCenterPage({ searchParams }: PageProps) {
  await requireRole([
    "administrator",
    "vorstand",
    "trainer",
    "social_media",
    "betreuer",
  ]);

  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: matches }, { data: packageRow }] = await Promise.all([
    supabase
      .from("matches")
      .select(
        "id,home_team,away_team,home_score,away_score,match_date,status,competition",
      )
      .or("home_team.ilike.%Middelich-Resse%,away_team.ilike.%Middelich-Resse%")
      .order("match_date", { ascending: false })
      .limit(50),
    params.package
      ? supabase
          .from("media_center_packages")
          .select("id,match_id,source,model,package,created_at")
          .eq("id", params.package)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const defaultMatch =
    (params.match && matches?.find((match) => match.id === params.match)?.id) ||
    matches?.find((match) => match.status === "finished")?.id ||
    matches?.[0]?.id ||
    "";

  return (
    <div className="mx-auto max-w-7xl pb-24">
      <div className="flex items-start gap-4">
        <div className="club-icon-box mt-1">
          <BrainCircuit size={21} />
        </div>
        <div>
          <p className="club-eyebrow">Version 17.1</p>
          <h1 className="club-heading mt-2">HUJA AI Engine</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Ein Spiel auswählen und vollständig lokal Instagram, Facebook, WhatsApp, Homepage, Presse, Story-Ablauf, Reel-Skript und Grafik-Headlines erstellen.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Info
          icon={<Bot size={18} />}
          title="Ohne Prompt"
          text="Die echten Match-Center-Daten werden automatisch ausgewertet."
        />
        <Info
          icon={<ImageIcon size={18} />}
          title="Grafiken verbunden"
          text="Das ausgewählte Spiel wird direkt ins Grafikstudio übernommen."
        />
        <Info
          icon={<Sparkles size={18} />}
          title="Keine API-Kosten"
          text="Die HUJA AI Engine arbeitet vollständig regelbasiert mit euren Matchdaten."
        />
      </div>

      <section className="club-card mt-7 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="club-icon-box">
            <WandSparkles size={19} />
          </div>
          <div>
            <p className="club-eyebrow">Neues Paket</p>
            <h2 className="mt-1 text-xl font-black uppercase text-white">
              Medienpaket erstellen
            </h2>
          </div>
        </div>

        <form action={generateAiMediaPackage} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
              Spiel
            </span>
            <select
              name="match_id"
              defaultValue={defaultMatch}
              required
              className="admin-input"
            >
              {(matches ?? []).map((match) => (
                <option key={match.id} value={match.id}>
                  {match.home_team} {match.home_score ?? "–"}:
                  {match.away_score ?? "–"} {match.away_team} ·{" "}
                  {match.competition}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
              Stil
            </span>
            <select name="tone" defaultValue="emotional" className="admin-input">
              <option value="emotional">Emotional und vereinsnah</option>
              <option value="professionell">Professionell und sachlich</option>
              <option value="kampferisch">Kämpferisch und kraftvoll</option>
              <option value="locker">Locker und modern</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
              Zusatzwunsch optional
            </span>
            <input
              name="extra_note"
              maxLength={500}
              placeholder="z. B. Teamgeist besonders betonen"
              className="admin-input"
            />
          </label>

          <button className="club-button-primary sm:col-span-2">
            <Sparkles size={18} />
            Komplettes Medienpaket erstellen
          </button>
        </form>
      </section>

      {packageRow && (
        <div className="mt-8">
          <MediaPackagePanel
            matchId={packageRow.match_id}
            source={packageRow.source}
            model={packageRow.model}
            packageData={packageRow.package as MediaCenterPackage}
          />
        </div>
      )}
    </div>
  );
}

function Info({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="club-card flex gap-3 p-4">
      <div className="text-club-light-red">{icon}</div>
      <div>
        <p className="font-black uppercase text-white">{title}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{text}</p>
      </div>
    </article>
  );
}
