import { Sparkles } from "lucide-react";
import vereinsLogo from "../../logo.png";
import { requireRole } from "../../../lib/auth/roles";
import { getSocialStudioData } from "../../../lib/social/data";
import SocialStudio from "../../../components/social/SocialStudio";

export default async function SocialStudioPage() {
  await requireRole(["administrator", "vorstand", "social_media"]);
  const { matches, news } = await getSocialStudioData();

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center gap-3">
        <div className="club-icon-box">
          <Sparkles size={19} aria-hidden="true" />
        </div>
        <div>
          <p className="club-eyebrow">Version 5.0</p>
          <h1 className="club-heading mt-1">Social Media Studio</h1>
        </div>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400">
        Erstelle Matchday-, Ergebnis- und News-Grafiken direkt aus euren
        Vereinsdaten. Die Vorschau kann als PNG für Feed, Story oder Quadrat
        exportiert werden.
      </p>

      <div className="mt-8">
        <SocialStudio
          matches={matches}
          news={news}
          logoSrc={vereinsLogo.src}
        />
      </div>
    </div>
  );
}
