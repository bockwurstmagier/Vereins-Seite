import Hero from "../components/home/Hero";
import CountdownFromSupabase from "../components/home/CountdownFromSupabase";
import LastMatchFromSupabase from "../components/home/LastMatchFromSupabase";
import LeagueTableFromSupabase from "../components/home/LeagueTableFromSupabase";
import NewsFromSupabase from "../components/home/NewsFromSupabase";
import GallerySection from "../components/home/GallerySection";
import SponsorFromSupabase from "../components/home/SponsorFromSupabase";
import TeamFromSupabase from "../components/home/TeamFromSupabase";
import NextMatchFromSupabase from "../components/home/NextMatchFromSupabase";
import FeaturedMatchCenter from "../components/match-center/FeaturedMatchCenter";
import BottomNavigation from "../components/home/layout/BottomNavigation";
import QuickLinks from "../components/home/QuickLinks";
import FussballNextMatchSection from "../components/home/FussballNextMatchSection";
import UpcomingEvents from "../components/calendar/UpcomingEvents";

export default function Home() {
  return (
    <main className="min-h-screen bg-black pb-24">
      <Hero />
      <FeaturedMatchCenter />
      <FussballNextMatchSection />
      <CountdownFromSupabase />
      <NextMatchFromSupabase />
      <LastMatchFromSupabase />
      <LeagueTableFromSupabase />
      <NewsFromSupabase />
      <UpcomingEvents />
      <GallerySection />
      <TeamFromSupabase />
      <SponsorFromSupabase />


      <QuickLinks />

      <BottomNavigation />
    </main>
  );
}