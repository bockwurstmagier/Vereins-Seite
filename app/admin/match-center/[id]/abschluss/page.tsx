import { notFound } from "next/navigation";
import { ArrowLeft, FilePenLine, Sparkles } from "lucide-react";

import MatchDayOutputPanel from "../../../../../components/match-center/MatchDayOutputPanel";
import { requireRole } from "../../../../../lib/auth/roles";
import { createClient } from "../../../../../lib/supabase/server";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export default async function MatchDayFinishPage({ params, searchParams }: Props) {
  await requireRole(["administrator", "trainer", "betreuer"]);
  const { id } = await params;
  const notices = await searchParams;
  const supabase = await createClient();

  const [{ data: match }, { data: output }] = await Promise.all([
    supabase.from("matches").select("id, home_team, away_team, home_score, away_score").eq("id", id).maybeSingle(),
    supabase.from("match_day_outputs").select("news_id, report, instagram_text, facebook_text, whatsapp_text, press_text, graphic_headline").eq("match_id", id).maybeSingle(),
  ]);

  if (!match || !output) notFound();

  return (
    <div className="mx-auto max-w-7xl pb-24">
      <a href={`/admin/match-center/${id}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-club-light-red">
        <ArrowLeft size={16} /> Zurück zum Match-Center
      </a>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="club-eyebrow">Ein-Klick-Spieltag</p>
          <h1 className="club-heading mt-2">Spiel erfolgreich abgeschlossen</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Ergebnis, LiveCenter, Spielerstatistiken, Push-Hinweis, Website-Entwurf und Social-Media-Texte wurden automatisch vorbereitet.
          </p>
        </div>
        {output.news_id && (
          <a href={`/admin/news/${output.news_id}`} className="club-button-secondary">
            <FilePenLine size={17} /> News-Entwurf bearbeiten
          </a>
        )}
      </div>

      {notices.created && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
          <Sparkles size={18} /> Alle Spieltagsaufgaben wurden ausgeführt.
        </div>
      )}

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
