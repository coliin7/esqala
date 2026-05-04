-- 006: Add MP OAuth token fields to profiles
alter table public.profiles
  add column if not exists mp_access_token text,
  add column if not exists mp_refresh_token text,
  add column if not exists mp_user_id text;
