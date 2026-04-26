-- =============================================
-- Plataforma de Cursos - Schema Inicial
-- =============================================

-- Profiles (extiende auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('creator', 'student')),
  display_name text not null,
  email text not null,
  avatar_url text,
  brand_name text,
  mp_connected boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Public profiles are readable"
  on public.profiles for select
  using (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- Courses
-- =============================================
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  title text not null,
  headline text,
  subheadline text,
  description_long text,
  hero_video_url text,
  learning_outcomes text[] not null default '{}',
  target_audience text[] not null default '{}',
  cta_text text not null default 'Comprar ahora',
  price_ars numeric(12,2) not null,
  price_usd numeric(10,2),
  installments_max int not null default 6,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "Anyone can read published courses"
  on public.courses for select
  using (status = 'published');

create policy "Creators can read own courses"
  on public.courses for select
  using (auth.uid() = creator_id);

create policy "Creators can insert own courses"
  on public.courses for insert
  with check (auth.uid() = creator_id);

create policy "Creators can update own courses"
  on public.courses for update
  using (auth.uid() = creator_id);

create policy "Creators can delete own courses"
  on public.courses for delete
  using (auth.uid() = creator_id);

create index idx_courses_slug on public.courses(slug);
create index idx_courses_creator on public.courses(creator_id);
create index idx_courses_status on public.courses(status);

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger courses_updated_at
  before update on public.courses
  for each row execute function public.update_updated_at();

-- =============================================
-- Course Modules
-- =============================================
create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.course_modules enable row level security;

create policy "Anyone can read modules of published courses"
  on public.course_modules for select
  using (
    exists (
      select 1 from public.courses
      where courses.id = course_modules.course_id
      and (courses.status = 'published' or courses.creator_id = auth.uid())
    )
  );

create policy "Creators can manage modules of own courses"
  on public.course_modules for all
  using (
    exists (
      select 1 from public.courses
      where courses.id = course_modules.course_id
      and courses.creator_id = auth.uid()
    )
  );

create index idx_modules_course on public.course_modules(course_id);

-- =============================================
-- Lessons
-- =============================================
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  position int not null default 0,
  video_bunny_id text,
  video_duration_sec int,
  materials jsonb not null default '[]',
  is_free_preview boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.lessons enable row level security;

create policy "Anyone can read lesson titles of published courses"
  on public.lessons for select
  using (
    exists (
      select 1 from public.course_modules m
      join public.courses c on c.id = m.course_id
      where m.id = lessons.module_id
      and (c.status = 'published' or c.creator_id = auth.uid())
    )
  );

create policy "Creators can manage lessons of own courses"
  on public.lessons for all
  using (
    exists (
      select 1 from public.course_modules m
      join public.courses c on c.id = m.course_id
      where m.id = lessons.module_id
      and c.creator_id = auth.uid()
    )
  );

create index idx_lessons_module on public.lessons(module_id);

-- =============================================
-- Testimonials
-- =============================================
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  author_name text not null,
  author_avatar_url text,
  content text not null,
  rating int not null default 5 check (rating between 1 and 5),
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

create policy "Anyone can read testimonials of published courses"
  on public.testimonials for select
  using (
    exists (
      select 1 from public.courses
      where courses.id = testimonials.course_id
      and (courses.status = 'published' or courses.creator_id = auth.uid())
    )
  );

create policy "Creators can manage testimonials of own courses"
  on public.testimonials for all
  using (
    exists (
      select 1 from public.courses
      where courses.id = testimonials.course_id
      and courses.creator_id = auth.uid()
    )
  );

create index idx_testimonials_course on public.testimonials(course_id);

-- =============================================
-- Orders
-- =============================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id),
  student_id uuid not null references public.profiles(id),
  status text not null default 'pending' check (status in ('pending', 'processing', 'approved', 'rejected', 'refunded')),
  amount_ars numeric(12,2) not null,
  platform_fee_ars numeric(12,2),
  creator_earning_ars numeric(12,2),
  mp_payment_id text unique,
  mp_preference_id text,
  installments int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Students can read own orders"
  on public.orders for select
  using (auth.uid() = student_id);

create policy "Creators can read orders for their courses"
  on public.orders for select
  using (
    exists (
      select 1 from public.courses
      where courses.id = orders.course_id
      and courses.creator_id = auth.uid()
    )
  );

create index idx_orders_student on public.orders(student_id);
create index idx_orders_course on public.orders(course_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_mp_payment on public.orders(mp_payment_id);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.update_updated_at();

-- =============================================
-- Enrollments
-- =============================================
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id),
  order_id uuid not null references public.orders(id),
  enrolled_at timestamptz not null default now(),
  unique(student_id, course_id)
);

alter table public.enrollments enable row level security;

create policy "Students can read own enrollments"
  on public.enrollments for select
  using (auth.uid() = student_id);

create policy "Creators can read enrollments for their courses"
  on public.enrollments for select
  using (
    exists (
      select 1 from public.courses
      where courses.id = enrollments.course_id
      and courses.creator_id = auth.uid()
    )
  );

create index idx_enrollments_student on public.enrollments(student_id);
create index idx_enrollments_course on public.enrollments(course_id);

-- =============================================
-- Creator Payouts (preparado para fase 2)
-- =============================================
create table public.creator_payouts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id),
  amount_ars numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  mp_transfer_id text,
  period_from date,
  period_to date,
  created_at timestamptz not null default now()
);

alter table public.creator_payouts enable row level security;

create policy "Creators can read own payouts"
  on public.creator_payouts for select
  using (auth.uid() = creator_id);

-- =============================================
-- Storage buckets
-- =============================================
insert into storage.buckets (id, name, public)
values ('materials', 'materials', true);

create policy "Creators can upload materials"
  on storage.objects for insert
  with check (bucket_id = 'materials' and auth.role() = 'authenticated');

create policy "Anyone can read materials"
  on storage.objects for select
  using (bucket_id = 'materials');
