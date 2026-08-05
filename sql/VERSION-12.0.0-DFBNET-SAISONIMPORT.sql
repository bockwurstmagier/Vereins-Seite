-- VERSION 12.0.0 – DFBnet-Saisonimport
-- Im Supabase SQL Editor vollständig ausführen.

alter table public.matches
  add column if not exists season text,
  add column if not exists source text,
  add column if not exists source_match_id text,
  add column if not exists import_key text,
  add column if not exists imported_at timestamptz;

create unique index if not exists matches_import_key_unique
on public.matches(import_key)
where import_key is not null;

create index if not exists matches_season_competition_idx
on public.matches(season, competition);

create table if not exists public.season_imports (
  id uuid primary key default gen_random_uuid(),
  season text not null,
  source text not null default 'dfbnet_csv',
  imported_matches integer not null default 0,
  competitions text[] not null default '{}',
  imported_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.season_imports enable row level security;

drop policy if exists "Saisonimporte für Verantwortliche lesen"
on public.season_imports;

create policy "Saisonimporte für Verantwortliche lesen"
on public.season_imports
for select
to authenticated
using (
  public.current_app_role() in ('administrator', 'vorstand')
);

drop policy if exists "Saisonimporte für Verantwortliche anlegen"
on public.season_imports;

create policy "Saisonimporte für Verantwortliche anlegen"
on public.season_imports
for insert
to authenticated
with check (
  public.current_app_role() in ('administrator', 'vorstand')
);
