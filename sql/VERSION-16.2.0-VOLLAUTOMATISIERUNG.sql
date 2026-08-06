-- VERSION 16.2.0 – Vollautomatisierung
-- Im Supabase SQL Editor vollständig ausführen.

create table if not exists public.match_automation_runs (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  status text not null default 'completed'
    check (status in ('running', 'completed', 'partial', 'failed')),
  steps jsonb not null default '{}'::jsonb,
  news_id uuid references public.news(id) on delete set null,
  completed_at timestamptz,
  error_message text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists match_automation_runs_match_idx
on public.match_automation_runs(match_id, created_at desc);

alter table public.match_automation_runs enable row level security;

drop policy if exists "Automatisierungen lesen" on public.match_automation_runs;
create policy "Automatisierungen lesen"
on public.match_automation_runs
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

drop policy if exists "Automatisierungen verwalten" on public.match_automation_runs;
create policy "Automatisierungen verwalten"
on public.match_automation_runs
for all
to authenticated
using (
  public.current_app_role() in ('administrator', 'trainer', 'betreuer')
)
with check (
  public.current_app_role() in ('administrator', 'trainer', 'betreuer')
);
