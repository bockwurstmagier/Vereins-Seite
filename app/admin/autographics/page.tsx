import { ImageIcon, Layers3, Sparkles, WandSparkles } from "lucide-react";

import vereinsLogo from "../../logo.png";
import AutoGraphicsStudio from "../../../components/social/AutoGraphicsStudio";
import { requireRole } from "../../../lib/auth/roles";
import { getSocialStudioData } from "../../../lib/social/data";

type PageProps = {
  searchParams: Promise<{ match?: string }>;
};

export default async function AutoGraphicsPage({ searchParams }: PageProps) {
  await requireRole([
    "administrator",
    "vorstand",
    "trainer",
    "social_media",
    "betreuer",
  ]);

  const { match } = await searchParams;
  const { matches, players, standings, goals } = await getSocialStudioData();

  return (
    <div className="mx-auto max-w-7xl pb-24">
      <div className="flex items-start gap-4">
        <div className="club-icon-box mt-1">
          <WandSparkles size={21} />
        </div>
        <div>
          <p className="club-eyebrow">Version 18.1</p>
          <h1 className="club-heading mt-2">HUJA AutoGraphics</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Erstellt nach dem Spiel automatisch das komplette Grafikpaket für
            Feed, Story, Reel und WhatsApp – vollständig aus euren Matchdaten.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Info
          icon={<Sparkles size={18} />}
          title="7 automatische Motive"
          text="Ergebnis, MVP, Torschützen, Tabelle, nächstes Spiel, Story und Reel."
        />
        <Info
          icon={<Layers3 size={18} />}
          title="Vereinsdesign"
          text="Dunkelrot, Rauchoptik, Logos, HUJA-Branding und starke Typografie."
        />
        <Info
          icon={<ImageIcon size={18} />}
          title="Direkter PNG-Export"
          text="Keine externe API, keine laufenden Kosten und sofort einsatzbereit."
        />
      </div>

      <div className="mt-8">
        <AutoGraphicsStudio
          matches={matches}
          players={players}
          standings={standings}
          goals={goals}
          clubLogoSrc={vereinsLogo.src}
          initialMatchId={match}
        />
      </div>
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
