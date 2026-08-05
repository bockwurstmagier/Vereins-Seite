-- VERSION 10.1.0 – Ein-Klick-Spieltag
-- Im Supabase SQL Editor vollständig ausführen.

alter table public.matches
  add column if not exists finalized_at timestamptz;

create table if not exists public.match_day_outputs (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  news_id uuid references public.news(id) on delete set null,
  title text not null,
  excerpt text,
  report text not null,
  instagram_text text not null,
  facebook_text text not null,
  whatsapp_text text not null,
  press_text text not null,
  graphic_headline text not null default 'ABPFIFF',
  summary jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.match_day_outputs enable row level security;

drop policy if exists "Angemeldete Benutzer lesen Spieltagsausgaben" on public.match_day_outputs;
create policy "Angemeldete Benutzer lesen Spieltagsausgaben"
on public.match_day_outputs for select to authenticated
using (true);

drop policy if exists "Angemeldete Benutzer erstellen Spieltagsausgaben" on public.match_day_outputs;
create policy "Angemeldete Benutzer erstellen Spieltagsausgaben"
on public.match_day_outputs for insert to authenticated
with check (auth.uid() = created_by);

drop policy if exists "Eigene Spieltagsausgaben bearbeiten" on public.match_day_outputs;
create policy "Eigene Spieltagsausgaben bearbeiten"
on public.match_day_outputs for update to authenticated
using (true)
with check (true);

comment on table public.match_day_outputs is
  'Automatisch erzeugte Text- und Grafikentwürfe nach dem Spielende.';
