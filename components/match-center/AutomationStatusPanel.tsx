import Link from "next/link";
import {
  BarChart3,
  BellRing,
  CheckCircle2,
  CircleDashed,
  FileText,
  ImageIcon,
  ListChecks,
  Sparkles,
  Trophy,
} from "lucide-react";

type Steps = {
  resultUpdated?: boolean;
  tableReady?: boolean;
  nextMatchReady?: boolean;
  reportPublished?: boolean;
  socialTextsReady?: boolean;
  graphicReady?: boolean;
  pushSent?: boolean;
};

type Props = {
  matchId: string;
  runStatus: string;
  steps: Steps;
  newsId: string | null;
  reportPublished: boolean;
};

export default function AutomationStatusPanel({
  matchId,
  runStatus,
  steps,
  newsId,
  reportPublished,
}: Props) {
  const tasks = [
    {
      key: "resultUpdated",
      label: "Ergebnis und LiveCenter abgeschlossen",
      detail: "Spielstatus, Spielzeit und Abschluss wurden gespeichert.",
      icon: Trophy,
    },
    {
      key: "tableReady",
      label: "Tabelle automatisch aktualisiert",
      detail: "Die Tabelle berechnet sich aus dem neuen Endergebnis.",
      icon: BarChart3,
    },
    {
      key: "nextMatchReady",
      label: "Nächstes Spiel automatisch nachgerückt",
      detail: "Startseite und Dashboard greifen auf die nächste Begegnung zu.",
      icon: ListChecks,
    },
    {
      key: "reportPublished",
      label: reportPublished
        ? "Homepage-Spielbericht veröffentlicht"
        : "Homepage-Spielbericht als Entwurf gespeichert",
      detail: reportPublished
        ? "Der Bericht ist direkt auf der Website sichtbar."
        : "Der Bericht kann vor der Veröffentlichung bearbeitet werden.",
      icon: FileText,
    },
    {
      key: "socialTextsReady",
      label: "Social-Media-Texte erstellt",
      detail: "Instagram, Facebook, WhatsApp und Pressetext sind vorbereitet.",
      icon: Sparkles,
    },
    {
      key: "graphicReady",
      label: "Ergebnisgrafik vorbereitet",
      detail: "PNG-Export und komplettes Grafikstudio stehen bereit.",
      icon: ImageIcon,
    },
    {
      key: "pushSent",
      label: "Abpfiff-Push versendet",
      detail: "Abonnenten wurden über das Endergebnis informiert.",
      icon: BellRing,
    },
  ] as const;

  const completed = tasks.filter(
    (task) => Boolean(steps[task.key]),
  ).length;

  return (
    <section className="club-card overflow-hidden">
      <div className="border-b border-white/10 bg-gradient-to-r from-club-burgundy/55 via-club-dark-red/20 to-transparent p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="club-icon-box">
              <ListChecks size={19} />
            </div>
            <div>
              <p className="club-eyebrow">Version 16.2</p>
              <h2 className="mt-1 text-xl font-black uppercase text-white">
                Automatik-Zentrale
              </h2>
            </div>
          </div>

          <div className="rounded-full border border-emerald-500/20 bg-emerald-950/25 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-300">
            {runStatus === "completed"
              ? `${completed}/${tasks.length} erledigt`
              : runStatus}
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
        {tasks.map((task) => {
          const done = Boolean(steps[task.key]);
          const Icon = task.icon;

          return (
            <article
              key={task.key}
              className={`rounded-3xl border p-4 ${
                done
                  ? "border-emerald-500/15 bg-emerald-950/15"
                  : "border-white/10 bg-black/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    done
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-white/[0.05] text-zinc-600"
                  }`}
                >
                  <Icon size={17} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {done ? (
                      <CheckCircle2 size={15} className="text-emerald-300" />
                    ) : (
                      <CircleDashed size={15} className="text-zinc-600" />
                    )}
                    <p className="text-sm font-black text-white">
                      {task.label}
                    </p>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    {task.detail}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-3 sm:p-6">
        {newsId && (
          <Link
            href={`/admin/news/${newsId}`}
            className="club-button-secondary justify-center"
          >
            <FileText size={16} />
            Spielbericht öffnen
          </Link>
        )}
        <Link
          href={`/admin/grafikstudio?match=${matchId}`}
          className="club-button-primary justify-center"
        >
          <ImageIcon size={16} />
          Medienpaket erstellen
        </Link>
        <Link
          href={`/admin/match-center/${matchId}`}
          className="club-button-secondary justify-center"
        >
          <Trophy size={16} />
          Match-Center öffnen
        </Link>
      </div>
    </section>
  );
}
