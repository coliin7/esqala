-- 008: add hero_video_vertical to courses
alter table public.courses
  add column if not exists hero_video_vertical boolean not null default false;
