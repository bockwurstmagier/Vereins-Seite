import { notFound } from "next/navigation";
import { ArrowLeft, Bot, FilePenLine, RefreshCw, Save, Sparkles, TriangleAlert } from "lucide-react";

import MatchDayOutputPanel from "../../../../../components/match-center/MatchDayOutputPanel";
import { requireRole } from "../../../../../lib/auth/roles";
import { createClient } from "../../../../../lib/supabase/server";
import {
  generateMatchDayWithAi,
  regenerateMatchDayFree,
} from "../../finalize-actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    created?: string;
    regenerated?: string;
    free?: string;
    ai?: string;
    saved?: string;
  }>;
};

export default async function MatchDayFinishPage({ params, searchParams }: Props) {
  await requireRole(["administrator", "trainer", "betreuer"]);
  const { id } = await params;
  const notices = await searchParams;
  const supabase = await createClient();

  const [{ data: match }, { data: output }] = await Promise.all([
    supabase
      .from("matches")
      .select("id, home_team, away_team, home_score, away_score")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("match_day_outputs")
      .select(
        "news_id, report, instagram_text, facebook_text, whatsapp_text, press_text, graphic_headline, ai_generated, ai_model, ai_error, generated_at",
      )
      .eq("match_id", id)
      .maybeSingle(),
  ]);

  if (!match || !output) notFound();

  return (
    <div className="mx-auto max-w-7xl pb-24">
      <a href={`/admin/match-center/${id}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-club-light-red">
        <ArrowLeft size={16} /> Zurück zum Match-Center
      </a>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="club-eyebrow">KI-Vereinsmanager</p>
          <h1 className="club-heading mt-2">Spieltag automatisch aufbereitet</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Spielbericht, Website-News und Social-Media-Texte werden standardmäßig kostenlos aus den gepflegten Matchdaten erstellt. Die kostenpflichtige KI-Veredelung ist optional und wird nur nach einem bewussten Klick ausgeführt.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <form action={regenerateMatchDayFree}>
            <input type="hidden" name="match_id" value={id} />
            <button type="submit" className="club-button-secondary w-full">
              <RefreshCw size={17} /> Kostenlos neu erstellen
            </button>
          </form>

          <form action={generateMatchDayWithAi}>
            <input type="hidden" name="match_id" value={id} />
            <button type="submit" className="club-button-primary w-full">
              <Sparkles size={17} /> Optional mit KI veredeln
            </button>
          </form>

          {output.news_id && (
            <a href={`/admin/news/${output.news_id}`} className="club-button-secondary">
              <FilePenLine size={17} /> News-Entwurf öffnen
            </a>
          )}
        </div>
      </div>

      {(notices.created || notices.regenerated || notices.free || notices.ai || notices.saved) && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
          {notices.saved ? <Save size={18} /> : <Sparkles size={18} />}
          {notices.saved
            ? "Deine Änderungen wurden gespeichert."
            : notices.ai
              ? "Die Texte wurden optional mit der KI veredelt."
              : notices.free || notices.regenerated
                ? "Die kostenlosen Vorlagentexte wurden neu erstellt."
                : "Alle Spieltagsaufgaben wurden kostenlos ausgeführt."}
        </div>
      )}

      <div className={`mt-6 rounded-3xl border p-4 ${output.ai_generated ? "border-violet-500/25 bg-violet-950/25" : "border-amber-500/25 bg-amber-950/25"}`}>
        <div className="flex items-start gap-3">
          <div className="club-icon-box">
            {output.ai_generated ? <Bot size={19} /> : <TriangleAlert size={19} />}
          </div>
          <div>
            <p className="text-sm font-black text-white">
              {output.ai_generated ? "KI-Entwürfe erfolgreich erstellt" : "Kostenloser Vorlagenmodus verwendet"}
            </p>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              {output.ai_generated
                ? `Modell: ${output.ai_model || "konfiguriertes OpenAI-Modell"}. Bitte Inhalte vor Veröffentlichung prüfen.`
                : output.ai_error || "Die Texte wurden kostenlos ohne externe KI-API erstellt."}
            </p>
          </div>
        </div>
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
