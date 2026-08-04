const nextMatch = {
  competition: "Kreisliga",
  matchday: "1. Spieltag",
  homeTeam: "SpVgg Middelich-Resse",
  awayTeam: "Gegner folgt",
  date: "Sonntag, 16. August 2026",
  time: "15:00 Uhr",
  location: "Kanzlerstraße 44, 45883 Gelsenkirchen",
};

export default function NextMatchCard() {
  return (
    <section
      id="next-match"
      className="relative scroll-mt-6 bg-black px-4 pb-14 pt-8 text-white"
    >
      <div className="mx-auto max-w-md">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
              Spieltag
            </p>

            <h2 className="mt-1 text-3xl font-black uppercase">
              Nächstes Spiel
            </h2>
          </div>

          <span className="rounded-full border border-red-600/40 bg-red-950/40 px-3 py-1 text-xs font-bold text-red-400">
            {nextMatch.competition}
          </span>
        </div>

        <article className="overflow-hidden rounded-3xl border border-red-600/30 bg-gradient-to-b from-[#240606] to-[#0d0d0d] shadow-[0_20px_60px_rgba(185,28,28,0.18)]">
          <div className="border-b border-white/10 px-5 py-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
              {nextMatch.matchday}
            </p>
          </div>

          <div className="px-5 py-8">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
              <div>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/30 bg-black/50 text-3xl font-black text-red-500">
                  MR
                </div>

                <p className="mt-3 text-sm font-extrabold leading-tight">
                  {nextMatch.homeTeam}
                </p>
              </div>

              <div>
                <span className="text-3xl font-black italic text-red-600">
                  VS
                </span>
              </div>

              <div>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-black/50 text-3xl font-black text-zinc-500">
                  ?
                </div>

                <p className="mt-3 text-sm font-extrabold leading-tight">
                  {nextMatch.awayTeam}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-black/35 p-4">
              <div className="flex gap-3">
                <span aria-hidden="true">📅</span>

                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Datum
                  </p>
                  <p className="font-semibold">{nextMatch.date}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span aria-hidden="true">⏰</span>

                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Anstoß
                  </p>
                  <p className="font-semibold">{nextMatch.time}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span aria-hidden="true">📍</span>

                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Spielort
                  </p>
                  <p className="font-semibold">{nextMatch.location}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Kanzlerstraße+44+45883+Gelsenkirchen"
                target="_blank"
                rel="noreferrer"
                className="flex min-h-13 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-bold uppercase transition active:scale-95"
              >
                Route
              </a>

              <button
                type="button"
                className="min-h-13 rounded-xl bg-red-600 px-3 text-sm font-black uppercase shadow-[0_0_25px_rgba(220,38,38,0.3)] transition active:scale-95"
              >
                Alle Spiele
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}