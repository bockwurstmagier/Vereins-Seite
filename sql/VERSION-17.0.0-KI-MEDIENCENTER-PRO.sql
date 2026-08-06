-- VERSION 17.0.0 – KI-Mediencenter Pro
-- Im Supabase SQL Editor vollständig ausführen.

create table if not exists public.media_center_packages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  tone text not null default 'emotional',
  source text not null default 'fallback'
    check (source in ('openai', 'fallback')),
  model text,
  package jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists media_center_packages_match_idx
on public.media_center_packages(match_id, created_at desc);

alter table public.media_center_packages enable row level security;

drop policy if exists "Medienpakete lesen" on public.media_center_packages;
create policy "Medienpakete lesen"
on public.media_center_packages
for select
to authenticated
using (
  public.current_app_role() in (
    'administrator',
    'vorstand',
    'trainer',
    'social_media',
    'betreuer'
  )
);

drop policy if exists "Medienpakete erstellen" on public.media_center_packages;
create policy "Medienpakete erstellen"
on public.media_center_packages
for insert
to authenticated
with check (
  public.current_app_role() in (
    'administrator',
    'vorstand',
    'trainer',
    'social_media',
    'betreuer'
  )
);
