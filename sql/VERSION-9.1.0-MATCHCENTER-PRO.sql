-- VERSION 9.1.0 – MatchCenter Pro: Formation und Taktiktafel

alter table public.matches
  add column if not exists formation text not null default '4-4-2';

alter table public.match_squad
  add column if not exists pitch_x numeric(5,2),
  add column if not exists pitch_y numeric(5,2),
  add column if not exists position_label text;

update public.match_squad
set pitch_x = coalesce(pitch_x, 50),
    pitch_y = coalesce(pitch_y, case when role = 'starter' then 50 else null end)
where role = 'starter';

comment on column public.matches.formation is 'Gespeicherte Grundformation, z. B. 4-4-2 oder 4-2-3-1.';
comment on column public.match_squad.pitch_x is 'Horizontale Position auf der Taktiktafel in Prozent.';
comment on column public.match_squad.pitch_y is 'Vertikale Position auf der Taktiktafel in Prozent.';
