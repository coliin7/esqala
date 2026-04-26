-- =============================================
-- Lesson Progress (tracking del alumno)
-- =============================================
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique(student_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

create policy "Students can read own progress"
  on public.lesson_progress for select
  using (auth.uid() = student_id);

create policy "Students can insert own progress"
  on public.lesson_progress for insert
  with check (auth.uid() = student_id);

create policy "Students can delete own progress"
  on public.lesson_progress for delete
  using (auth.uid() = student_id);

create index idx_progress_student on public.lesson_progress(student_id);
create index idx_progress_lesson on public.lesson_progress(lesson_id);
