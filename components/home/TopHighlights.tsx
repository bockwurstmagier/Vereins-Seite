import type { TopHighlight } from "../../lib/top-highlights";
export default function TopHighlights({ clips }: { clips: TopHighlight[] }) {
  if (!clips.length) return null;
  return <section className="club-section py-10"><div className="club-container"><h2 className="club-heading mb-6">🔥 Top Highlights</h2>
    <div className="grid gap-5">{clips.map(clip => <article key={clip.id} className="club-card overflow-hidden">
      <video src={clip.videoUrl} controls playsInline preload="none" className="aspect-video w-full bg-black object-contain" />
      <div className="p-5"><p className="text-xs font-bold text-amber-300">⭐ {clip.minute}′ · gegen {clip.opponent}</p><h3 className="mt-2 font-black text-white">{clip.description}</h3>{clip.player && <p className="mt-1 text-zinc-300">{clip.player}</p>}{clip.matchId && <a href={`/match-center/${clip.matchId}`} className="mt-4 inline-block text-sm text-club-light-red">Zum Spiel →</a>}</div>
    </article>)}</div></div></section>;
}
