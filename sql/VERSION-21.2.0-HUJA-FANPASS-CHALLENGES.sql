-- HUJA v21.2.0 – Fanpass & Saison-Challenges
-- Baut auf v21.0.0 und v21.1.0 auf.

create table if not exists public.fan_profiles (
  fan_hash text primary key,
  display_name text not null default 'HUJA-Fan',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.match_predictions add column if not exists fan_hash text;
alter table public.match_reactions add column if not exists fan_hash text;
alter table public.fan_poll_votes add column if not exists fan_hash text;

create index if not exists match_predictions_fan_hash_idx on public.match_predictions(fan_hash);
create index if not exists match_reactions_fan_hash_idx on public.match_reactions(fan_hash);
create index if not exists fan_poll_votes_fan_hash_idx on public.fan_poll_votes(fan_hash);

alter table public.fan_profiles enable row level security;
revoke all on public.fan_profiles from anon, authenticated;
-- Zugriff ausschließlich über HUJA Serverrouten / Service Role.
