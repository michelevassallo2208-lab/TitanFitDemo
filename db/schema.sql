create extension if not exists "uuid-ossp";

create table if not exists users (
  id text primary key,
  username text not null unique,
  password text not null,
  full_name text not null,
  role text not null,
  assigned_plan_id text,
  plan_history jsonb,
  goals text
);

create table if not exists plans (
  id text primary key,
  name text not null,
  description text not null,
  days jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists exercises (
  id text primary key,
  name text not null,
  muscle_group text not null,
  video_url text not null,
  description text not null,
  tips jsonb not null,
  is_custom boolean not null default true
);
