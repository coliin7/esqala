-- Allow authenticated users to insert their own profile
-- (needed as fallback when the trigger fails for OAuth signups)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
