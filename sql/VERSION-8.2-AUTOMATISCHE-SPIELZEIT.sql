-- Vereinsmanager v8.2 – automatische Spielzeit
-- Im Supabase SQL Editor vollständig ausführen.

alter table public.matches
  add column if not exists clock_phase text,
  add column if not exists clock_started_at timestamptz,
  add column if not exists clock_base_minute integer;

update public.matches
set
  clock_phase = case
    when status = 'finished' then 'finished'
    else 'stopped'
  end,
  clock_base_minute = coalesce(current_minute, 0)
where clock_phase is null
   or clock_base_minute is null;

alter table public.matches
  alter column clock_phase set default 'stopped',
  alter column clock_base_minute set default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'matches_clock_phase_check'
  ) then
    alter table public.matches
      add constraint matches_clock_phase_check
      check (
        clock_phase in (
          'stopped',
          'first_half',
          'halftime',
          'second_half',
          'finished'
        )
      );
  end if;
end
$$;

comment on column public.matches.clock_phase is
  'Status der automatischen Spieluhr';

comment on column public.matches.clock_started_at is
  'Startzeit des aktuell laufenden Spielabschnitts';

comment on column public.matches.clock_base_minute is
  'Angezeigte Minute beim Start des aktuellen Spielabschnitts';
