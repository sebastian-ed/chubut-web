-- CHUBUT WEB V7 — Supabase CMS schema
-- Run in Supabase SQL Editor.
-- This script is idempotent and can upgrade the V5/V6 schema.

create extension if not exists pgcrypto;

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  slug text not null default 'home',
  payload jsonb not null,
  note text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  path text not null unique,
  url text not null,
  mime_type text,
  size_bytes bigint,
  alt_text jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.trip_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  interest text,
  language text not null default 'en',
  source text not null default 'public-home'
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_site_content_updated_at on public.site_content;
create trigger trg_site_content_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;
alter table public.content_revisions enable row level security;
alter table public.media_assets enable row level security;
alter table public.trip_leads enable row level security;

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content" on public.site_content
for select to anon, authenticated using (true);

drop policy if exists "Authenticated can manage site content" on public.site_content;
create policy "Authenticated can manage site content" on public.site_content
for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated can read revisions" on public.content_revisions;
create policy "Authenticated can read revisions" on public.content_revisions
for select to authenticated using (true);

drop policy if exists "Authenticated can create revisions" on public.content_revisions;
create policy "Authenticated can create revisions" on public.content_revisions
for insert to authenticated with check (true);

drop policy if exists "Authenticated can manage media records" on public.media_assets;
create policy "Authenticated can manage media records" on public.media_assets
for all to authenticated using (true) with check (true);

drop policy if exists "Public can submit trip leads" on public.trip_leads;
create policy "Public can submit trip leads" on public.trip_leads
for insert to anon, authenticated
with check (char_length(name) between 1 and 160 and language in ('en','es'));

drop policy if exists "Authenticated can read trip leads" on public.trip_leads;
create policy "Authenticated can read trip leads" on public.trip_leads
for select to authenticated using (true);

insert into public.site_content (slug, payload)
values ('home', '{}'::jsonb)
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public)
values ('chubut-media', 'chubut-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can view Chubut media" on storage.objects;
create policy "Public can view Chubut media" on storage.objects
for select to public using (bucket_id = 'chubut-media');

drop policy if exists "Authenticated can upload Chubut media" on storage.objects;
create policy "Authenticated can upload Chubut media" on storage.objects
for insert to authenticated with check (bucket_id = 'chubut-media');

drop policy if exists "Authenticated can update Chubut media" on storage.objects;
create policy "Authenticated can update Chubut media" on storage.objects
for update to authenticated using (bucket_id = 'chubut-media') with check (bucket_id = 'chubut-media');

drop policy if exists "Authenticated can delete Chubut media" on storage.objects;
create policy "Authenticated can delete Chubut media" on storage.objects
for delete to authenticated using (bucket_id = 'chubut-media');

create index if not exists content_revisions_slug_created_at_idx on public.content_revisions (slug, created_at desc);
create index if not exists trip_leads_created_at_idx on public.trip_leads (created_at desc);
create index if not exists media_assets_created_at_idx on public.media_assets (created_at desc);
