-- HUJA v22.5.0 – Player Sync & Birthday Automation
alter table public.players add column if not exists fussball_profile_url text;
alter table public.players add column if not exists fussball_user_id text;
alter table public.players add column if not exists fussball_synced_at timestamptz;
create index if not exists players_fussball_user_id_idx on public.players(fussball_user_id) where fussball_user_id is not null;
