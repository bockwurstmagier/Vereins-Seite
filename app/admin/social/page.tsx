import { Sparkles } from "lucide-react";
import vereinsLogo from "../../logo.png";
import { requireRole } from "../../../lib/auth/roles";
import { getSocialStudioData } from "../../../lib/social/data";
import SocialStudio from "../../../components/social/SocialStudio";

export default async function SocialStudioPage() {
  await requireRole(["administrator", "vorstand", "social_media"]);
  const { matches, news, players, sponsors, standings, goals } = await getSocialStudioData();

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center gap-3">
        <div className="club-icon-box">
          <Sparkles size={19} aria-hidden="true" />
        </div>
        <div>
          <p className="club-eyebrow">Version 6.2</p>
          <h1 className="club-heading mt-1">Social Media Studio 2.0</h1>
        </div>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400">
        Erstelle Matchday-, Ergebnis-, Tabellen-, Torschützen-, Spieler-des-Spiels-, News-, Spieler- und Sponsorengrafiken
        direkt aus euren Vereinsdaten. Passe Texte, Farben und Hintergründe an
        und exportiere die fertige Grafik als PNG.
      </p>

      <div className="mt-8">
        <SocialStudio
          matches={matches}
          news={news}
          players={players}
          sponsors={sponsors}
          standings={standings}
          goals={goals}
          logoSrc={vereinsLogo.src}
        />
      </div>
    </div>
  );
}
