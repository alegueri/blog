-- Run this in your Supabase SQL editor

-- ── Posts ────────────────────────────────────────────────────────
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null default '',
  excerpt text not null default '',
  content text not null default '',
  tags text[] not null default '{}',
  published boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at on edit
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
  before update on posts
  for each row execute function update_updated_at();

alter table posts enable row level security;

-- Public can read published posts; logged-in users (admin) can read all
create policy "posts_select" on posts for select
  using (published = true or auth.role() = 'authenticated');

-- Only authenticated users can write (app enforces admin email check on top)
create policy "posts_insert" on posts for insert
  with check (auth.role() = 'authenticated');
create policy "posts_update" on posts for update
  using (auth.role() = 'authenticated');
create policy "posts_delete" on posts for delete
  using (auth.role() = 'authenticated');

-- ── Comments ─────────────────────────────────────────────────────
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  user_name text not null,
  user_avatar text,
  body text not null check (char_length(body) > 0 and char_length(body) <= 1000),
  created_at timestamptz default now()
);

alter table comments enable row level security;

create policy "comments_read" on comments for select using (true);
create policy "comments_insert" on comments for insert
  with check (auth.uid() = user_id);
create policy "comments_delete" on comments for delete
  using (auth.uid() = user_id);

-- ── Likes ────────────────────────────────────────────────────────
create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  unique (post_slug, user_id)
);

alter table likes enable row level security;

create policy "likes_read" on likes for select using (true);
create policy "likes_insert" on likes for insert
  with check (auth.uid() = user_id);
create policy "likes_delete" on likes for delete
  using (auth.uid() = user_id);

-- ── Indexes ──────────────────────────────────────────────────────
create index on posts (published, created_at desc);
create index on comments (post_slug, created_at desc);
create index on likes (post_slug);
