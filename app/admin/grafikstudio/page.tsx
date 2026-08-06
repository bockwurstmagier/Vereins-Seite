import { ImageIcon, PackageCheck, Sparkles } from "lucide-react";

import vereinsLogo from "../../logo.png";
import OneClickGraphicStudio from "../../../components/social/OneClickGraphicStudio";
import { requireRole } from "../../../lib/auth/roles";
import { getSocialStudioData } from "../../../lib/social/data";

export default async function GraphicStudioPage() {
  await requireRole([
    "administrator",
    "vorstand",
    "trainer",
    "social_media",
    "betreuer",
  ]);

  const { matches, players, standings, goals } = await getSocialStudioData();

  return (
    <div className="mx-auto max-w-7xl pb-24">
      <div className="flex items-start gap-4">
        <div className="club-icon-box mt-1">
          <Sparkles size={21} />
        </div>
        <div>
          <p className="club-eyebrow">Automatische Medienproduktion</p>
          <h1 className="club-heading mt-2">HUJA Ein-Klick-Grafikstudio</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Wähle ein Spiel und erstelle mit einem Klick ein vollständiges
            Social-Media-Paket für Feed, Story und WhatsApp.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Info
          icon={<PackageCheck size={18} />}
          title="7 Grafiken"
          text="Matchday, Ergebnis, Torschützen, MVP und Tabelle."
        />
        <Info
          icon={<ImageIcon size={18} />}
          title="Automatische Daten"
          text="Logos, Spieltermin, Ergebnis und Torschützen werden übernommen."
        />
        <Info
          icon={<Sparkles size={18} />}
          title="Keine API-Kosten"
          text="Das Paket wird direkt im Browser als PNG gerendert."
        />
      </div>

      <div className="mt-8">
        <OneClickGraphicStudio
          matches={matches}
          players={players}
          standings={standings}
          goals={goals}
          clubLogoSrc={vereinsLogo.src}
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
