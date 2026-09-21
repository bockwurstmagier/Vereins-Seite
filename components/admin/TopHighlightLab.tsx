"use client";
import { useEffect, useState } from "react";
import TopHighlights from "../home/TopHighlights";
import { isTopHighlight } from "../../lib/top-highlights";

export default function TopHighlightLab({ goal, finished }: { goal: { id: string; minute: number; player: string } | null; finished: boolean }) {
  const [clip, setClip] = useState<{ goalId: string; url: string } | null>(null);
  const [marked, setMarked] = useState(false);
  const [enabled, setEnabled] = useState(true);
  useEffect(() => () => { if (clip) URL.revokeObjectURL(clip.url); }, [clip]);
  const active = goal && clip?.goalId === goal.id ? clip : null;
  const visible = enabled && isTopHighlight({ is_highlight: marked, video_url: active?.url }, finished ? "finished" : "live");
  return <section className="club-card p-5"><h2 className="text-xl font-black text-white">⭐ Top-Moment-Test</h2>
    <p className="my-3 text-sm text-zinc-400">Im Test-Labor ein Tor simulieren, hier ein lokales Video auswählen und als Top Moment markieren. Nach „Abpfiff“ erscheint die Vorschau. Das Video bleibt im Browser und wird nicht hochgeladen.</p>
    <p className="my-3 text-white">{goal ? `${goal.minute}′ · Tor ${goal.player}` : "Zuerst ein Tor simulieren."}</p>
    <input aria-label="Lokales Testvideo" type="file" accept="video/*" disabled={!goal} onChange={event => { const file = event.target.files?.[0]; if (file?.type.startsWith("video/") && goal) { setClip({ goalId: goal.id, url: URL.createObjectURL(file) }); setMarked(false); } }} className="block max-w-full text-zinc-300" />
    <label className="mt-4 flex min-h-12 items-center gap-3 text-amber-300"><input type="checkbox" checked={marked} onChange={event => setMarked(event.target.checked)} />⭐ Top Moment</label>
    <label className="flex min-h-12 items-center gap-3 text-white"><input type="checkbox" checked={enabled} onChange={event => setEnabled(event.target.checked)} />Startseitenmodul aktiv</label>
    {visible && active && goal ? <TopHighlights clips={[{ id: goal.id, matchId: "", videoUrl: active.url, minute: goal.minute, description: "⚽ Tor-Moment", player: goal.player, opponent: "Testgegner" }]} /> : <p className="text-sm text-zinc-500">Top Highlights ausgeblendet: benötigt Tor, Video, Markierung, aktives Modul und Abpfiff.</p>}
  </section>;
}
