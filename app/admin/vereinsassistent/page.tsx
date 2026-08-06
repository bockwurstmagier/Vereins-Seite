import { Bot, Database, MessageCircleQuestion } from "lucide-react";

import { requireRole } from "../../../lib/auth/roles";
import ClubAssistant from "./ClubAssistant";

export default async function ClubAssistantPage() {
  await requireRole([
    "administrator",
    "vorstand",
    "trainer",
    "social_media",
    "betreuer",
  ]);

  return (
    <div className="mx-auto max-w-7xl pb-24">
      <div className="flex items-start gap-4">
        <div className="club-icon-box mt-1">
          <Bot size={21} />
        </div>
        <div>
          <p className="club-eyebrow">Digitale Vereinszentrale</p>
          <h1 className="club-heading mt-2">HUJA Vereinsassistent</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Stelle Fragen in normaler Sprache. Der Assistent wertet Spielplan,
            Tabelle, Ergebnisse und Spielerstatistiken direkt aus Supabase aus.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Info
          icon={<Database size={18} />}
          title="Echte Vereinsdaten"
          text="Keine erfundenen Antworten: Es werden nur vorhandene Daten ausgewertet."
        />
        <Info
          icon={<MessageCircleQuestion size={18} />}
          title="Normale Fragen"
          text="Zum Beispiel nach nächstem Spiel, Form, Torjägern oder Tabellenplatz."
        />
      </div>

      <div className="mt-8">
        <ClubAssistant />
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
    <div className="club-card flex gap-3 p-4">
      <div className="text-club-light-red">{icon}</div>
      <div>
        <p className="font-black uppercase text-white">{title}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{text}</p>
      </div>
    </div>
  );
}
