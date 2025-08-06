-- Script SQL pour créer la table 'audios' dans Supabase
create extension if not exists "uuid-ossp";

create table if not exists public.audios (
  id uuid primary key default uuid_generate_v4(),
  audio_url text not null,
  theme text not null,
  category text not null,
  created_at timestamp with time zone default now(),
  reports integer not null default 0
); 