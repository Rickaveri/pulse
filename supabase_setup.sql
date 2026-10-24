-- ============================================================================
-- SQL-СКРИПТ НАСТРОЙКИ БАЗЫ ДАННЫХ МЕССЕНДЖЕРА (SUPABASE)
-- Скопируйте весь этот текст в раздел SQL Editor -> New Query и нажмите Run
-- ============================================================================

-- 1. Таблица профилей пользователей
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text not null,
  avatar_color text default '#3b82f6',
  created_at timestamptz default now(),
  last_seen timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Профили видны всем авторизованным" on public.profiles;
create policy "Профили видны всем авторизованным"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Пользователь может обновлять свой профиль" on public.profiles;
create policy "Пользователь может обновлять свой профиль"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Пользователь может создавать свой профиль" on public.profiles;
create policy "Пользователь может создавать свой профиль"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Автоматическое создание профиля при регистрации
create or replace function public.handle_new_user()
returns trigger as $$
declare
  colors text[] := array['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444'];
  random_color text;
begin
  random_color := colors[floor(random() * array_length(colors, 1) + 1)];
  insert into public.profiles (id, email, display_name, avatar_color)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    random_color
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Таблица комнат (чатов и личных диалогов)
create table if not exists public.rooms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  is_group boolean default true,
  direct_key text unique, -- для личных чатов вида "uid1_uid2"
  created_by uuid references auth.users on delete set null,
  created_at timestamptz default now()
);

alter table public.rooms enable row level security;

drop policy if exists "Комнаты доступны авторизованным пользователям" on public.rooms;
create policy "Комнаты доступны авторизованным пользователям"
  on public.rooms for select
  to authenticated
  using (true);

drop policy if exists "Авторизованные могут создавать комнаты" on public.rooms;
create policy "Авторизованные могут создавать комнаты"
  on public.rooms for insert
  to authenticated
  with check (true);

-- Создаём стартовый общий чат для семьи и друзей
insert into public.rooms (id, name, is_group, direct_key)
values ('00000000-0000-0000-0000-000000000001', 'Общий чат (Семья и друзья)', true, 'general_main_room')
on conflict (id) do nothing;

-- 3. Таблица сообщений (текст, фото, голосовые)
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  sender_name text not null,
  sender_color text default '#3b82f6',
  content text default '',
  media_type text default 'text' check (media_type in ('text', 'image', 'audio')),
  media_url text,
  media_duration integer default 0,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

drop policy if exists "Сообщения видны авторизованным" on public.messages;
create policy "Сообщения видны авторизованным"
  on public.messages for select
  to authenticated
  using (true);

drop policy if exists "Авторизованные могут отправлять сообщения" on public.messages;
create policy "Авторизованные могут отправлять сообщения"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = sender_id);

drop policy if exists "Авторы могут удалять свои сообщения" on public.messages;
create policy "Авторы могут удалять свои сообщения"
  on public.messages for delete
  to authenticated
  using (auth.uid() = sender_id);

-- 4. Хранилище (Storage Bucket) для фотографий и голосовых сообщений
insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Публичный доступ к просмотру медиа" on storage.objects;
create policy "Публичный доступ к просмотру медиа"
  on storage.objects for select
  to public
  using (bucket_id = 'chat-media');

drop policy if exists "Авторизованные могут загружать медиа" on storage.objects;
create policy "Авторизованные могут загружать медиа"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'chat-media');

-- 5. Включаем Realtime (мгновенную доставку без перезагрузки)
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table public.messages, public.rooms, public.profiles;
commit;
