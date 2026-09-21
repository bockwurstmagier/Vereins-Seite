import { MATCH_GROUPS, type MatchGroup } from "../../lib/match-selection";

export default function CompetitionNavigation({ base, selected, counts }: { base: string; selected: MatchGroup; counts: Record<MatchGroup, number> }) {
  return <nav aria-label="Spielbereiche" className="my-6 flex flex-wrap gap-2">
    {MATCH_GROUPS.map(group => <a key={group.id} href={`${base}?group=${group.id}`} aria-current={selected === group.id ? "page" : undefined}
      className={`flex min-h-12 items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold ${selected === group.id ? "border-red-400 bg-club-red text-white" : "border-white/15 bg-black/30 text-zinc-300 hover:border-red-400"}`}>
      {group.label}<span className="rounded-full bg-black/25 px-2 text-xs">{counts[group.id]}</span>
    </a>)}
  </nav>;
}
