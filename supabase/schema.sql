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

create table if not exists public.import_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'review',
  document_type text not null default 'mixed',
  source_files jsonb not null default '[]'::jsonb,
  raw_text_preview text not null default '',
  parsed_items jsonb not null default '[]'::jsonb,
  cost_warning_items jsonb not null default '[]'::jsonb,
  total_count integer not null default 0,
  approved_count integer not null default 0,
  duplicate_count integer not null default 0,
  imported_count integer not null default 0,
  skipped_count integer not null default 0,
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists import_sessions_user_id_updated_at_idx
on public.import_sessions (user_id, updated_at desc);

alter table public.import_sessions enable row level security;

create policy "Users can read their own import sessions"
on public.import_sessions
for select
using (auth.uid() = user_id);

create policy "Users can insert their own import sessions"
on public.import_sessions
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own import sessions"
on public.import_sessions
for update
using (auth.uid() = user_id);
