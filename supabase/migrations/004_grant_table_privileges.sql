-- Grant schema and table privileges to anon and authenticated roles.
-- RLS policies control row-level access; these grants allow the roles
-- to perform the operations at all (prerequisite for RLS to apply).

grant usage on schema public to anon, authenticated;

-- profiles
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;

-- courses
grant select on public.courses to anon;
grant select, insert, update, delete on public.courses to authenticated;

-- course_modules
grant select on public.course_modules to anon;
grant select, insert, update, delete on public.course_modules to authenticated;

-- lessons
grant select on public.lessons to anon;
grant select, insert, update, delete on public.lessons to authenticated;

-- testimonials
grant select on public.testimonials to anon;
grant select, insert, update, delete on public.testimonials to authenticated;

-- orders
grant select, insert, update on public.orders to authenticated;

-- enrollments
grant select, insert on public.enrollments to authenticated;

-- creator_payouts
grant select on public.creator_payouts to authenticated;

-- sequences (needed for auto-increment / gen_random_uuid fallbacks)
grant usage on all sequences in schema public to authenticated;
