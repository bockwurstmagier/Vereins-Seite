import Hero from "../components/home/Hero";
import CountdownFromSupabase from "../components/home/CountdownFromSupabase";
import LastMatchFromSupabase from "../components/home/LastMatchFromSupabase";
import LeagueTable from "../components/home/LeagueTable";
import NewsFromSupabase from "../components/home/NewsFromSupabase";
import GallerySection from "../components/home/GallerySection";
import SponsorFromSupabase from "../components/home/SponsorFromSupabase";
import TeamFromSupabase from "../components/home/TeamFromSupabase";
import NextMatchFromSupabase from "../components/home/NextMatchFromSupabase";
import FeaturedMatchCenter from "../components/match-center/FeaturedMatchCenter";
import BottomNavigation from "../components/home/layout/BottomNavigation";
import QuickLinks from "../components/home/QuickLinks";

export default function Home() {
  return (
    <main className="min-h-screen bg-black pb-24">
      <Hero />
      <FeaturedMatchCenter />
      <CountdownFromSupabase />
      <NextMatchFromSupabase />
      <LastMatchFromSupabase />
      <LeagueTable />
      <NewsFromSupabase />
      <GallerySection />
      <TeamFromSupabase />
      <SponsorFromSupabase />


      <QuickLinks />

      <BottomNavigation />
    </main>
  );
}