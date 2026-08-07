import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="top"
      className="huja-stadium-hero relative h-[100svh] min-h-[700px] w-full scroll-mt-20 overflow-hidden bg-black"
    >
      <Image
        src="/images/hero.png"
        alt="Stadion der SpVgg Middelich-Resse"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-red-950/10 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,transparent_6%,rgba(0,0,0,0.22)_42%,rgba(0,0,0,0.86)_100%)]" />

      <div className="huja-hero-smoke huja-hero-smoke-left" />
      <div className="huja-hero-smoke huja-hero-smoke-right" />
      <div className="huja-hero-embers absolute inset-0" aria-hidden="true" />

      <div className="absolute left-1/2 top-[31%] h-80 w-80 -translate-x-1/2 rounded-full bg-red-600/20 blur-[90px]" />

      <div className="relative z-10 mx-auto flex h-full max-w-md flex-col items-center justify-center px-5 pb-24 pt-10 text-center">
        <div className="huja-hero-crest relative w-[205px] sm:w-[235px]">
          <div className="absolute inset-[-16%] rounded-full bg-red-600/16 blur-3xl" />
          <Image
            src="/branding/middelich-resse-original.png"
            alt="Wappen der SpVgg Middelich-Resse"
            width={1194}
            height={1166}
            priority
            className="relative h-auto w-full object-contain"
          />
        </div>

        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.42em] text-red-400">
          Club Management System
        </p>

        <h1 className="huja-hero-word mt-4 text-[4.9rem] font-black uppercase leading-[0.78] tracking-[-0.07em] text-white sm:text-[5.8rem]">
          HUJA
          <sup className="ml-2 align-top text-sm font-black tracking-normal text-red-400">™</sup>
        </h1>

        <p className="huja-hero-slogan mt-5 text-[1.15rem] font-black uppercase italic leading-tight tracking-tight text-red-500 sm:text-[1.35rem]">
          Die Middelicher sind da.
        </p>

        <p className="mt-4 max-w-xs text-[10px] font-bold uppercase leading-5 tracking-[0.22em] text-zinc-300">
          Tradition · Kampf · Leidenschaft
        </p>

        <a
          href="#next-match"
          className="huja-hero-button mt-8 inline-flex min-h-14 items-center justify-center rounded-2xl border border-red-400/40 bg-black/45 px-8 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur-xl transition duration-300 hover:scale-105 hover:border-red-400/70 hover:bg-red-950/60 active:scale-95"
        >
          Nächstes Spiel
        </a>

        <a
          href="#next-match"
          aria-label="Nach unten zum nächsten Spiel"
          className="absolute bottom-7 flex h-10 w-10 animate-bounce items-center justify-center rounded-full border border-red-400/30 bg-black/45 text-xl text-white shadow-[0_0_24px_rgba(239,51,64,0.2)] backdrop-blur-md"
        >
          ↓
        </a>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black via-black/80 to-transparent" />
    </section>
  );
}
