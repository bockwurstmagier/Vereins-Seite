import type { Metadata } from "next";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import FussballWidget from "../../components/fussball/FussballWidget";

export const metadata: Metadata = {
  title: "Offizielle Spieldaten",
  description: "Offizielle Spieldaten der SpVgg Middelich-Resse von FUSSBALL.DE.",
};

const NEXT_MATCH_WIDGET_ID = "0e4d6599-b984-4c8e-ba9d-d5e864925837";

export default function FussballPage() {
  return (
    <main className="min-h-screen bg-club-black px-4 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-club-light-red"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Zurück zur Startseite
        </a>

        <div className="mt-8 flex items-center gap-2">
          <BadgeCheck className="text-emerald-400" aria-hidden="true" />
          <p className="club-eyebrow">FUSSBALL.DE</p>
        </div>
        <h1 className="club-heading mt-2">Offizielle Spieldaten</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Die folgenden Angaben werden direkt über das offizielle Widget von
          FUSSBALL.DE geladen.
        </p>

        <div className="mt-8">
          <FussballWidget
            widgetId={NEXT_MATCH_WIDGET_ID}
            widgetType="next-match"
            title="Offizielles nächstes Spiel"
          />
        </div>
      </div>
    </main>
  );
}
