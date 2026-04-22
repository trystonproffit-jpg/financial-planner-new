create table if not exists public.planner_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  budget_target numeric not null default 4500,
  transactions jsonb not null default '[]'::jsonb,
  custom_categories jsonb not null default '[]'::jsonb,
  category_budgets jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.planner_profiles enable row level security;

create policy "Users can read their own planner profile"
on public.planner_profiles
for select
using (auth.uid() = user_id);

create policy "Users can insert their own planner profile"
on public.planner_profiles
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own planner profile"
on public.planner_profiles
for update
using (auth.uid() = user_id);
