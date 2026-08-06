-- VERSION 15.1.0 – Spieler-Einladungssystem
-- Voraussetzung: Version 15.0.0 wurde bereits installiert.

create table if not exists public.player_invitations (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  invited_email text,
  phone_number text,
  token text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists player_invitations_player_idx
on public.player_invitations(player_id);

create index if not exists player_invitations_status_idx
on public.player_invitations(expires_at, accepted_at, revoked_at);

alter table public.player_invitations enable row level security;

drop policy if exists "Spielereinladungen lesen" on public.player_invitations;
create policy "Spielereinladungen lesen"
on public.player_invitations
for select
to authenticated
using (
  public.current_app_role() in ('administrator', 'vorstand', 'trainer', 'betreuer')
);

drop policy if exists "Spielereinladungen anlegen" on public.player_invitations;
create policy "Spielereinladungen anlegen"
on public.player_invitations
for insert
to authenticated
with check (
  public.current_app_role() in ('administrator', 'vorstand', 'trainer', 'betreuer')
);

drop policy if exists "Spielereinladungen ändern" on public.player_invitations;
create policy "Spielereinladungen ändern"
on public.player_invitations
for update
to authenticated
using (
  public.current_app_role() in ('administrator', 'vorstand', 'trainer', 'betreuer')
)
with check (
  public.current_app_role() in ('administrator', 'vorstand', 'trainer', 'betreuer')
);
