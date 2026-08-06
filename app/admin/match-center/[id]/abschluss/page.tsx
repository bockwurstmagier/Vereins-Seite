import { notFound } from "next/navigation";
import { ArrowLeft, FilePenLine, Sparkles } from "lucide-react";

import AutomationStatusPanel from "../../../../../components/match-center/AutomationStatusPanel";
import MatchDayOutputPanel from "../../../../../components/match-center/MatchDayOutputPanel";
import { requireRole } from "../../../../../lib/auth/roles";
import { createClient } from "../../../../../lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; run?: string }>;
};

export default async function MatchDayFinishPage({
  params,
  searchParams,
}: Props) {
  await requireRole(["administrator", "trainer", "betreuer"]);

  const { id } = await params;
  const notices = await searchParams;
  const supabase = await createClient();

  const [
    { data: match },
    { data: output },
    { data: automationRun },
  ] = await Promise.all([
    supabase
      .from("matches")
      .select("id, home_team, away_team, home_score, away_score")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("match_day_outputs")
      .select(
        "news_id, report, instagram_text, facebook_text, whatsapp_text, press_text, graphic_headline, summary",
      )
      .eq("match_id", id)
      .maybeSingle(),
    notices.run
      ? supabase
          .from("match_automation_runs")
          .select("status,steps,news_id,error_message")
          .eq("id", notices.run)
          .maybeSingle()
      : supabase
          .from("match_automation_runs")
          .select("status,steps,news_id,error_message")
          .eq("match_id", id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
  ]);

  if (!match || !output) notFound();

  const summary =
    output.summary && typeof output.summary === "object"
      ? (output.summary as Record<string, unknown>)
      : {};

  const reportPublished = summary.publishReport !== false;

  return (
    <div className="mx-auto max-w-7xl pb-24">
      <a
        href={`/admin/match-center/${id}`}
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-club-light-red"
      >
        <ArrowLeft size={16} />
        Zurück zum Match-Center
      </a>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="club-eyebrow">Vollautomatisierung</p>
          <h1 className="club-heading mt-2">
            Spieltag vollständig verarbeitet
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Ergebnis, Tabelle, nächstes Spiel, Website-Bericht,
            Social-Media-Texte, Ergebnisgrafik und Push-Hinweis wurden in einem
            Arbeitsgang verarbeitet.
          </p>
        </div>

        {output.news_id && (
          <a
            href={`/admin/news/${output.news_id}`}
            className="club-button-secondary"
          >
            <FilePenLine size={17} />
            Spielbericht bearbeiten
          </a>
        )}
      </div>

      {notices.created && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
          <Sparkles size={18} />
          Alle automatischen Spieltagsaufgaben wurden ausgeführt.
        </div>
      )}

      <div className="mt-8">
        <AutomationStatusPanel
          matchId={match.id}
          runStatus={automationRun?.status ?? "completed"}
          steps={(automationRun?.steps ?? {}) as Record<string, boolean>}
          newsId={automationRun?.news_id ?? output.news_id ?? null}
          reportPublished={reportPublished}
        />
      </div>

      <div className="mt-8">
        <MatchDayOutputPanel
          matchId={match.id}
          homeTeam={match.home_team}
          awayTeam={match.away_team}
          homeScore={match.home_score ?? 0}
          awayScore={match.away_score ?? 0}
          headline={output.graphic_headline}
          instagramText={output.instagram_text}
          facebookText={output.facebook_text}
          whatsappText={output.whatsapp_text}
          pressText={output.press_text}
          report={output.report}
        />
      </div>
    </div>
  );
}
