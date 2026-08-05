import Hero from "../components/home/Hero";
import CountdownFromSupabase from "../components/home/CountdownFromSupabase";
import LastMatchFromSupabase from "../components/home/LastMatchFromSupabase";
import LeagueTable from "../components/home/LeagueTable";
import NewsFromSupabase from "../components/home/NewsFromSupabase";
import GallerySection from "../components/home/GallerySection";
import SponsorSection from "../components/home/SponsorSection";
import TeamFromSupabase from "../components/home/TeamFromSupabase";
import NextMatchFromSupabase from "../components/home/NextMatchFromSupabase";
import BottomNavigation from "../components/home/layout/BottomNavigation";

export default function Home() {
  return (
    <main className="min-h-screen bg-black pb-24">
      <Hero />
      <CountdownFromSupabase />
      <NextMatchFromSupabase />
      <LastMatchFromSupabase />
      <LeagueTable />
      <NewsFromSupabase />
      <GallerySection />
      <TeamFromSupabase />
      <SponsorSection />


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