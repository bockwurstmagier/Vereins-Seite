import Image from "next/image";
import vereinsLogo from "@/app/logo.png";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative h-[100svh] min-h-[680px] w-full scroll-mt-20 overflow-hidden bg-black"
    >
      {/* Hintergrundbild */}
      <Image
        src="/images/hero.png"
        alt="Stadion der SpVgg Middelich-Resse"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Abdunklung für bessere Lesbarkeit */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Farbverläufe */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-red-950/15 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(0,0,0,0.75)_100%)]" />

      {/* Dezenter roter Lichtschein */}
      <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-red-700/15 blur-3xl" />

      {/* Inhalt */}
      <div className="relative z-10 mx-auto flex h-full max-w-md flex-col items-center justify-center px-5 pb-24 pt-8 text-center">
        <Image
          src={vereinsLogo}
          alt="Logo der SpVgg Middelich-Resse"
          priority
          className="h-auto w-[145px] object-contain drop-shadow-[0_0_32px_rgba(220,38,38,0.8)] sm:w-[165px]"
        />

        <p className="mt-7 text-xs font-bold uppercase tracking-[0.38em] text-red-400">
          Seit 1971
        </p>

        <h1 className="mt-3 text-5xl font-black uppercase leading-none tracking-wide text-white sm:text-6xl">
          SpVgg
        </h1>

        <h2 className="mt-2 text-[2.15rem] font-black uppercase leading-none tracking-tight text-red-500 sm:text-5xl">
          Middelich-Resse
        </h2>

        <p className="mt-6 max-w-xs text-xs font-semibold uppercase leading-6 tracking-[0.2em] text-zinc-200 sm:text-sm">
          Tradition · Kampf · Leidenschaft
        </p>

        <a
          href="#next-match"
          className="mt-9 inline-flex min-h-14 items-center justify-center rounded-2xl border border-red-400/30 bg-red-600 px-8 text-sm font-black uppercase tracking-wider text-white shadow-[0_0_35px_rgba(220,38,38,0.45)] transition duration-300 hover:scale-105 hover:bg-red-700 active:scale-95"
        >
          Nächstes Spiel
        </a>

        <a
          href="#next-match"
          aria-label="Nach unten zum nächsten Spiel"
          className="absolute bottom-7 flex h-10 w-10 animate-bounce items-center justify-center rounded-full border border-white/15 bg-black/35 text-xl text-white backdrop-blur-md"
        >
          ↓
        </a>
      </div>

      {/* Übergang zum nächsten Bereich */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/75 to-transparent" />
    </section>
  );
}