import Hero from "../components/home/Hero";
import CountdownFromSupabase from "../components/home/CountdownFromSupabase";
import LastMatchFromSupabase from "../components/home/LastMatchFromSupabase";
import AutoLeagueTable from "../components/home/AutoLeagueTable";
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
import HomeAtmosphere from "../components/home/HomeAtmosphere";
import PlayerOfMatchVoting from "../components/home/PlayerOfMatchVoting";
import MatchdayHub from "../components/home/MatchdayHub";
import FanPassCard from "../components/fan/FanPassCard";

export default function Home() {
  return (
    <main className="huja-home huja-stadium-experience min-h-screen bg-black pb-24">
      <Hero />

      <div className="huja-home-content relative isolate overflow-hidden">
        <HomeAtmosphere />
        <div className="relative z-10">
          <MatchdayHub />
          <FanPassCard />
          <FeaturedMatchCenter />
          <FussballNextMatchSection />
          <CountdownFromSupabase />
          <NextMatchFromSupabase />
          <LastMatchFromSupabase />
          <PlayerOfMatchVoting />
          <AutoLeagueTable />
          <NewsFromSupabase />
          <UpcomingEvents />
          <GallerySection />
          <TeamFromSupabase />
          <SponsorFromSupabase />
          <QuickLinks />
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
}