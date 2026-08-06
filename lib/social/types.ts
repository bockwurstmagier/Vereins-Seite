export type SocialFormat = "feed" | "story" | "square";
export type SocialTemplate = "matchday" | "result" | "news" | "player" | "sponsor";

export type SocialMatch = {
  id: string;
  competition: string;
  home_team: string;
  away_team: string;
  match_date: string;
  location: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string;
  home_logo_url?: string | null;
  away_logo_url?: string | null;
};

export type SocialNews = {
  id: string;
  title: string;
  category: string;
  excerpt: string | null;
  image_url: string | null;
};

export type SocialPlayer = {
  id: string;
  first_name: string;
  last_name: string;
  squad: string;
  shirt_number: number | null;
  position: string;
  image_url: string | null;
};

export type SocialSponsor = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
};
