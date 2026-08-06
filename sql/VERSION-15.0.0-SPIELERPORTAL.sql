-- VERSION 15.0.0 – Spielerportal
-- Im Supabase SQL Editor vollständig ausführen.

-- Rolle "spieler" in vorhandenen Rollen-Checks erlauben.
do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.user_profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format(
      'alter table public.user_profiles drop constraint if exists %I',
      constraint_name
    );
  end loop;
end $$;

alter table public.user_profiles
  add constraint user_profiles_role_check
  check (
    role in (
      'administrator',
      'vorstand',
      'trainer',
      'social_media',
      'betreuer',
      'spieler'
    )
  );

create table if not exists public.player_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  player_id uuid not null unique references public.players(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.player_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  event_type text not null check (event_type in ('training', 'match')),
  event_id uuid not null,
  response text not null check (response in ('yes', 'maybe', 'no')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(player_id, event_type, event_id)
);

create index if not exists player_responses_event_idx
on public.player_responses(event_type, event_id);

create table if not exists public.player_messages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all'
    check (audience in ('all', 'first_team', 'second_team', 'individual')),
  player_id uuid references public.players(id) on delete cascade,
  is_important boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.player_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_url text not null,
  audience text not null default 'all'
    check (audience in ('all', 'first_team', 'second_team', 'individual')),
  player_id uuid references public.players(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.player_injury_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status text not null default 'open'
    check (status in ('open', 'reviewed', 'closed')),
  body_area text,
  description text not null,
  available_from date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.player_accounts enable row level security;
alter table public.player_responses enable row level security;
alter table public.player_messages enable row level security;
alter table public.player_documents enable row level security;
alter table public.player_injury_reports enable row level security;

drop policy if exists "Spielerverknüpfung lesen" on public.player_accounts;
create policy "Spielerverknüpfung lesen"
on public.player_accounts for select to authenticated
using (
  user_id = auth.uid()
  or public.current_app_role() in ('administrator', 'vorstand', 'trainer', 'betreuer')
);

drop policy if exists "Spielerverknüpfung verwalten" on public.player_accounts;
create policy "Spielerverknüpfung verwalten"
on public.player_accounts for all to authenticated
using (public.current_app_role() in ('administrator', 'vorstand'))
with check (public.current_app_role() in ('administrator', 'vorstand'));

drop policy if exists "Eigene Antworten lesen" on public.player_responses;
create policy "Eigene Antworten lesen"
on public.player_responses for select to authenticated
using (
  user_id = auth.uid()
  or public.current_app_role() in ('administrator', 'vorstand', 'trainer', 'betreuer')
);

drop policy if exists "Eigene Antworten speichern" on public.player_responses;
create policy "Eigene Antworten speichern"
on public.player_responses for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.player_accounts pa
    where pa.user_id = auth.uid()
      and pa.player_id = player_responses.player_id
  )
);

drop policy if exists "Eigene Antworten ändern" on public.player_responses;
create policy "Eigene Antworten ändern"
on public.player_responses for update to authenticated
using (
  user_id = auth.uid()
  or public.current_app_role() in ('administrator', 'vorstand', 'trainer', 'betreuer')
)
with check (
  user_id = auth.uid()
  or public.current_app_role() in ('administrator', 'vorstand', 'trainer', 'betreuer')
);

drop policy if exists "Spielernachrichten lesen" on public.player_messages;
create policy "Spielernachrichten lesen"
on public.player_messages for select to authenticated
using (
  public.current_app_role() in ('administrator', 'vorstand', 'trainer', 'betreuer')
  or (
    public.current_app_role() = 'spieler'
    and (
      audience = 'all'
      or player_id = (
        select pa.player_id
        from public.player_accounts pa
        where pa.user_id = auth.uid()
      )
    )
  )
);

drop policy if exists "Spielernachrichten verwalten" on public.player_messages;
create policy "Spielernachrichten verwalten"
on public.player_messages for all to authenticated
using (public.current_app_role() in ('administrator', 'vorstand', 'trainer', 'betreuer'))
with check (public.current_app_role() in ('administrator', 'vorstand', 'trainer', 'betreuer'));

drop policy if exists "Spielerdokumente lesen" on public.player_documents;
create policy "Spielerdokumente lesen"
on public.player_documents for select to authenticated
using (
  public.current_app_role() in ('administrator', 'vorstand', 'trainer', 'betreuer')
  or (
    public.current_app_role() = 'spieler'
    and (
      audience = 'all'
      or player_id = (
        select pa.player_id
        from public.player_accounts pa
        where pa.user_id = auth.uid()
      )
    )
  )
);

drop policy if exists "Spielerdokumente verwalten" on public.player_documents;
create policy "Spielerdokumente verwalten"
on public.player_documents for all to authenticated
using (public.current_app_role() in ('administrator', 'vorstand'))
with check (public.current_app_role() in ('administrator', 'vorstand'));

drop policy if exists "Eigene Verletzungsmeldungen lesen" on public.player_injury_reports;
create policy "Eigene Verletzungsmeldungen lesen"
on public.player_injury_reports for select to authenticated
using (
  user_id = auth.uid()
  or public.current_app_role() in ('administrator', 'vorstand', 'trainer', 'betreuer')
);

drop policy if exists "Eigene Verletzungsmeldung anlegen" on public.player_injury_reports;
create policy "Eigene Verletzungsmeldung anlegen"
on public.player_injury_reports for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.player_accounts pa
    where pa.user_id = auth.uid()
      and pa.player_id = player_injury_reports.player_id
  )
);

drop policy if exists "Verletzungsmeldungen verwalten" on public.player_injury_reports;
create policy "Verletzungsmeldungen verwalten"
on public.player_injury_reports for update to authenticated
using (
  user_id = auth.uid()
  or public.current_app_role() in ('administrator', 'vorstand', 'trainer', 'betreuer')
)
with check (
  user_id = auth.uid()
  or public.current_app_role() in ('administrator', 'vorstand', 'trainer', 'betreuer')
);
