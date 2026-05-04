-- 007: precio tachado + video de bienvenida en cursos
alter table public.courses
  add column if not exists price_compare_ars numeric,
  add column if not exists welcome_video_bunny_id text;
