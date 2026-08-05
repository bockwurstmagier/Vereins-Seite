import { DatabaseZap, FileSpreadsheet, RefreshCw } from "lucide-react";

import { requireRole } from "../../../lib/auth/roles";
import DfbnetSeasonImporter from "./DfbnetSeasonImporter";

type SearchParams = Promise<{
  success?: string;
  matches?: string;
  teams?: string;
}>;

export default async function SeasonImportPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole(["administrator", "vorstand"]);
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start gap-4">
        <div className="club-icon-box mt-1">
          <DatabaseZap size={20} />
        </div>
        <div>
          <p className="club-eyebrow">Automatisierung</p>
          <h1 className="club-heading mt-2">DFBnet-Saisonimport</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Importiere den Vereins- oder Staffelspielplan einmal als CSV. Das
            System versorgt danach automatisch nächstes Spiel, Countdown,
            letztes Ergebnis, Spielplan, Match-Center und Saisonstatistiken.
          </p>
        </div>
      </div>

      {params.success && (
        <div className="mt-6 rounded-3xl border border-emerald-500/20 bg-emerald-950/25 p-5 text-emerald-100">
          <p className="font-black">Saisonimport erfolgreich abgeschlossen.</p>
          <p className="mt-2 text-sm text-emerald-100/70">
            {params.matches || "0"} Spiele wurden angelegt oder aktualisiert.
            {Number(params.teams || 0) > 0
              ? ` Die Tabelle wurde für ${params.teams} Mannschaften neu berechnet.`
              : ""}
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Info
          icon={<FileSpreadsheet size={18} />}
          title="Einmal importieren"
          text="Kompletter Saisonspielplan in wenigen Sekunden."
        />
        <Info
          icon={<RefreshCw size={18} />}
          title="Später aktualisieren"
          text="Neue CSV einlesen – Termine und Ergebnisse werden abgeglichen."
        />
        <Info
          icon={<DatabaseZap size={18} />}
          title="Alles verbunden"
          text="Startseite, Countdown, Tabelle und Statistiken nutzen dieselben Daten."
        />
      </div>

      <div className="mt-8">
        <DfbnetSeasonImporter />
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
    <div className="club-card p-4">
      <div className="text-club-light-red">{icon}</div>
      <p className="mt-3 font-black uppercase text-white">{title}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{text}</p>
    </div>
  );
}
