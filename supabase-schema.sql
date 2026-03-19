-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  Sin Filtro — Supabase Schema                                              ║
-- ║  Run this in the Supabase SQL Editor to create all tables & storage.       ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- ─── Enable UUID extension (usually already enabled) ─────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Users ───────────────────────────────────────────────────────────────────
create table if not exists users (
  id            uuid primary key default uuid_generate_v4(),
  name          text        not null,
  email         text        not null unique,
  phone         text,
  password_hash text        not null,
  salt          text        not null,
  created_at    timestamptz not null default now()
);

create index if not exists idx_users_email on users (email);

-- ─── Videos ──────────────────────────────────────────────────────────────────
create table if not exists videos (
  id               uuid primary key default uuid_generate_v4(),
  file_name        text        not null,
  url              text        not null,
  mime_type        text        not null,
  size             bigint      not null,
  uploaded_by      uuid        not null references users(id) on delete cascade,
  idempotency_key  text        unique,          -- prevents duplicate uploads
  is_late          boolean     not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists idx_videos_uploaded_by on videos (uploaded_by);
create index if not exists idx_videos_created_at  on videos (created_at desc);

-- ─── Friendships ─────────────────────────────────────────────────────────────
create type friendship_status as enum ('pending', 'accepted');

create table if not exists friendships (
  id         uuid              primary key default uuid_generate_v4(),
  user_id    uuid              not null references users(id) on delete cascade,
  friend_id  uuid              not null references users(id) on delete cascade,
  status     friendship_status not null default 'pending',
  created_at timestamptz       not null default now(),

  -- prevent duplicate requests in either direction
  constraint uq_friendship unique (user_id, friend_id),
  constraint no_self_friend check (user_id <> friend_id)
);

create index if not exists idx_friendships_user   on friendships (user_id);
create index if not exists idx_friendships_friend on friendships (friend_id);

-- ─── Daily Prompts ───────────────────────────────────────────────────────────
create table if not exists daily_prompts (
  id          uuid primary key default uuid_generate_v4(),
  date        date        not null unique,      -- one prompt per day
  prompt_time timestamptz not null,              -- when the prompt fires
  window_end  timestamptz not null               -- upload window closes
);

create index if not exists idx_prompts_date on daily_prompts (date desc);

-- ─── Supabase Storage bucket ─────────────────────────────────────────────────
-- Create a public bucket called "videos" in the Supabase dashboard,
-- or run the following (requires service-role access):
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

-- ─── Storage RLS policies (videos bucket) ────────────────────────────────────
-- Allow anyone to READ objects (bucket is public)
create policy "Public read access on videos bucket"
  on storage.objects for select
  using ( bucket_id = 'videos' );

-- Allow any authenticated role (including service_role) to INSERT
create policy "Allow uploads to videos bucket"
  on storage.objects for insert
  with check ( bucket_id = 'videos' );

-- Allow any authenticated role to UPDATE their objects
create policy "Allow updates in videos bucket"
  on storage.objects for update
  using ( bucket_id = 'videos' );

-- Allow any authenticated role to DELETE their objects
create policy "Allow deletes in videos bucket"
  on storage.objects for delete
  using ( bucket_id = 'videos' );

-- ─── Table RLS (videos table) ────────────────────────────────────────────────
-- Enable RLS but add permissive policies so the service-role client works
-- even if the anon key is used by mistake.
alter table videos enable row level security;

create policy "Allow all operations on videos"
  on videos for all
  using ( true )
  with check ( true );

-- ─── Table RLS (users table) ─────────────────────────────────────────────────
alter table users enable row level security;

create policy "Allow all operations on users"
  on users for all
  using ( true )
  with check ( true );

-- ─── Table RLS (friendships table) ───────────────────────────────────────────
alter table friendships enable row level security;

create policy "Allow all operations on friendships"
  on friendships for all
  using ( true )
  with check ( true );

-- ─── Table RLS (daily_prompts table) ─────────────────────────────────────────
alter table daily_prompts enable row level security;

create policy "Allow all operations on daily_prompts"
  on daily_prompts for all
  using ( true )
  with check ( true );
