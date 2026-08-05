export type SocialFormat = "feed" | "story" | "square";
export type SocialTemplate = "matchday" | "result" | "news";

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
};

export type SocialNews = {
  id: string;
  title: string;
  category: string;
  excerpt: string | null;
  image_url: string | null;
};
