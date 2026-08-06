-- VERSION 13.1.0 – Trainercockpit Pro
-- Im Supabase SQL Editor vollständig ausführen.

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Training',
  session_date timestamptz not null,
  location text,
  focus text,
  intensity integer not null default 3 check (intensity between 1 and 5),
  duration_minutes integer not null default 90 check (duration_minutes between 1 and 300),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists training_sessions_date_idx
on public.training_sessions(session_date desc);

create table if not exists public.training_attendance (
  id uuid primary key default gen_random_uuid(),
  training_session_id uuid not null references public.training_sessions(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'present', 'late', 'excused', 'absent', 'injured')),
  minutes integer,
  note text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(training_session_id, player_id)
);

create index if not exists training_attendance_player_idx
on public.training_attendance(player_id);

create table if not exists public.player_availability (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  status text not null
    check (status in ('fit', 'questionable', 'injured', 'suspended', 'unavailable', 'rehab')),
  reason text,
  start_date date not null default current_date,
  end_date date,
  note text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists player_availability_active_idx
on public.player_availability(player_id, is_active);

alter table public.training_sessions enable row level security;
alter table public.training_attendance enable row level security;
alter table public.player_availability enable row level security;

drop policy if exists "Trainerdaten lesen" on public.training_sessions;
create policy "Trainerdaten lesen"
on public.training_sessions for select to authenticated
using (public.current_app_role() in ('administrator', 'trainer', 'betreuer', 'vorstand'));

drop policy if exists "Trainerdaten verwalten" on public.training_sessions;
create policy "Trainerdaten verwalten"
on public.training_sessions for all to authenticated
using (public.current_app_role() in ('administrator', 'trainer', 'betreuer'))
with check (public.current_app_role() in ('administrator', 'trainer', 'betreuer'));

drop policy if exists "Trainingsanwesenheit lesen" on public.training_attendance;
create policy "Trainingsanwesenheit lesen"
on public.training_attendance for select to authenticated
using (public.current_app_role() in ('administrator', 'trainer', 'betreuer', 'vorstand'));

drop policy if exists "Trainingsanwesenheit verwalten" on public.training_attendance;
create policy "Trainingsanwesenheit verwalten"
on public.training_attendance for all to authenticated
using (public.current_app_role() in ('administrator', 'trainer', 'betreuer'))
with check (public.current_app_role() in ('administrator', 'trainer', 'betreuer'));

drop policy if exists "Verfügbarkeit lesen" on public.player_availability;
create policy "Verfügbarkeit lesen"
on public.player_availability for select to authenticated
using (public.current_app_role() in ('administrator', 'trainer', 'betreuer', 'vorstand'));

drop policy if exists "Verfügbarkeit verwalten" on public.player_availability;
create policy "Verfügbarkeit verwalten"
on public.player_availability for all to authenticated
using (public.current_app_role() in ('administrator', 'trainer', 'betreuer'))
with check (public.current_app_role() in ('administrator', 'trainer', 'betreuer'));
