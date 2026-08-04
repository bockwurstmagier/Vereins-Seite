import Hero from "../components/home/Hero";
import NextMatchCard from "../components/home/NextMatchCard";
import BottomNavigation from "../components/home/layout/BottomNavigation";

export default function Home() {
  return (
    <main className="min-h-screen bg-black pb-24">
      <Hero />
      <NextMatchCard />

      <section id="news" className="scroll-mt-20 bg-black px-5 py-16 text-white">
        <h2 className="text-3xl font-black uppercase">News</h2>
        <p className="mt-3 text-zinc-400">
          Hier erscheinen später die neuesten Vereinsmeldungen.
        </p>
      </section>

      <section id="team" className="scroll-mt-20 bg-zinc-950 px-5 py-16 text-white">
        <h2 className="text-3xl font-black uppercase">Mannschaft</h2>
        <p className="mt-3 text-zinc-400">
          Hier erscheinen später Spieler, Trainer und Betreuer.
        </p>
      </section>

      <section id="more" className="scroll-mt-20 bg-black px-5 py-16 text-white">
        <h2 className="text-3xl font-black uppercase">Mehr</h2>
        <p className="mt-3 text-zinc-400">
          Sponsoren, Galerie, Verein, Kontakt und Impressum.
        </p>
      </section>

      <BottomNavigation />
    </main>
  );
}