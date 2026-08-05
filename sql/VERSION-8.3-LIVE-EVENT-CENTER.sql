-- Vereinsmanager v8.3 – Live Event Center
-- Im Supabase SQL Editor vollständig ausführen.

alter table public.matches
  add column if not exists clock_resume_phase text;

update public.matches
set clock_resume_phase = case
  when clock_phase = 'second_half' then 'second_half'
  when clock_phase = 'first_half' then 'first_half'
  else null
end
where clock_resume_phase is null;

alter table public.matches
  drop constraint if exists matches_clock_phase_check;

alter table public.matches
  add constraint matches_clock_phase_check
  check (
    clock_phase in (
      'stopped',
      'first_half',
      'halftime',
      'second_half',
      'paused',
      'finished'
    )
  );

alter table public.matches
  drop constraint if exists matches_clock_resume_phase_check;

alter table public.matches
  add constraint matches_clock_resume_phase_check
  check (
    clock_resume_phase is null
    or clock_resume_phase in ('first_half', 'second_half')
  );

comment on column public.matches.clock_resume_phase is
  'Spielabschnitt, in dem eine pausierte Uhr fortgesetzt wird';
