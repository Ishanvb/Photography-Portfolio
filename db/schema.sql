-- MariPortfolio admin schema
-- Run once in the Supabase SQL editor.
--
-- Security model: every table has RLS enabled with NO policies, so the public
-- anon key can read nothing. All access goes through the serverless functions
-- in /api using the service-role key, which bypasses RLS. The API is the only door.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- content ---

create table if not exists projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text not null default '',   -- /work tile subtitle, e.g. "COLLECTIONS: 8"
  count_label   text not null default '',   -- project page label, e.g. "[ Photo Collections: 8 ]"
  body_text     text not null default '',
  hero_jpg      text,
  hero_webp     text,
  cover_jpg     text,                       -- tile shown on /work
  cover_webp    text,
  title_offset  jsonb not null default '{}'::jsonb, -- styled-components prop bag for the title
  media_kind    text not null default 'photo' check (media_kind in ('photo','video')),
  sort_order    int  not null default 0,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists photos (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  youtube_id  text,                      -- set for video projects; url_jpg is null then
  url_jpg     text,
  url_webp    text,
  alt         text not null default '',
  width       int,
  height      int,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  constraint photos_has_media check (url_jpg is not null or youtube_id is not null)
);

create index if not exists photos_project_idx on photos(project_id, sort_order);

create table if not exists reel_items (
  id                 uuid primary key default gen_random_uuid(),
  url_jpg            text not null,
  url_webp           text,
  title              text not null default '',
  caption            text not null default '',
  target_slug        text,        -- project slug to navigate to on click
  target_photo_index int,         -- index within that project's gallery
  is_narrow          boolean not null default false, -- renders as a narrow frame
  sort_order         int not null default 0,
  created_at         timestamptz not null default now()
);

create index if not exists reel_order_idx on reel_items(sort_order);

-- ------------------------------------------------------------------ auth ---

create table if not exists admin_credentials (
  id            text primary key,           -- base64url credential ID
  public_key    text not null,              -- base64url; bytea does not round-trip via PostgREST
  counter       bigint not null default 0,
  transports    text[] not null default '{}',
  device_name   text not null default 'Unnamed device',
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz
);

create table if not exists admin_invites (
  token_hash  text primary key,             -- sha256 of the one-time token
  label       text not null default '',
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- --------------------------------------------------------------------- rls ---

alter table projects           enable row level security;
alter table photos             enable row level security;
alter table reel_items         enable row level security;
alter table admin_credentials  enable row level security;
alter table admin_invites      enable row level security;
