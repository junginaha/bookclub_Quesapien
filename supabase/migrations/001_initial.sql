-- ============================================================
-- 질문하는 사람들 — 초기 스키마
-- ============================================================

-- profiles (auth.users 에서 자동 생성)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text not null default '',
  avatar_url  text,
  bio         text,
  joined_at   timestamptz not null default now(),
  session_count int not null default 0
);

-- questions
create table public.questions (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  description       text not null default '',
  category          text not null,
  tags              text[] not null default '{}',
  author_id         uuid not null references public.profiles(id) on delete cascade,
  created_at        timestamptz not null default now(),
  session_count     int not null default 0,
  participant_total int not null default 0,
  is_featured       boolean not null default false
);

-- sessions
create table public.sessions (
  id                  uuid primary key default gen_random_uuid(),
  question_id         uuid not null references public.questions(id) on delete cascade,
  host_id             uuid not null references public.profiles(id) on delete cascade,
  location            text not null,
  address             text,
  date                date not null,
  start_time          time not null,
  end_time            time not null,
  max_participants    int not null default 8,
  current_participants int not null default 0,
  status              text not null default 'upcoming'
                        check (status in ('upcoming', 'live', 'closed')),
  created_at          timestamptz not null default now()
);

-- session_participants (참여자 연결 테이블)
create table public.session_participants (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  unique (session_id, user_id)
);

-- reviews
create table public.reviews (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references public.sessions(id) on delete cascade,
  author_id      uuid not null references public.profiles(id) on delete cascade,
  type           text not null default 'text'
                   check (type in ('text', 'photo', 'video')),
  content        text not null,
  photo_url      text,
  video_url      text,
  quote          text,
  transformation text,
  created_at     timestamptz not null default now(),
  likes          int not null default 0
);

-- review_likes
create table public.review_likes (
  id        uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (review_id, user_id)
);

-- ============================================================
-- RLS 활성화
-- ============================================================
alter table public.profiles           enable row level security;
alter table public.questions          enable row level security;
alter table public.sessions           enable row level security;
alter table public.session_participants enable row level security;
alter table public.reviews            enable row level security;
alter table public.review_likes       enable row level security;

-- ============================================================
-- RLS 정책
-- ============================================================

-- profiles
create policy "profiles_select_all"  on public.profiles for select using (true);
create policy "profiles_insert_own"  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"  on public.profiles for update using (auth.uid() = id);

-- questions
create policy "questions_select_all"   on public.questions for select using (true);
create policy "questions_insert_auth"  on public.questions for insert with check (auth.uid() = author_id);
create policy "questions_update_own"   on public.questions for update using (auth.uid() = author_id);
create policy "questions_delete_own"   on public.questions for delete using (auth.uid() = author_id);

-- sessions
create policy "sessions_select_all"   on public.sessions for select using (true);
create policy "sessions_insert_auth"  on public.sessions for insert with check (auth.uid() = host_id);
create policy "sessions_update_host"  on public.sessions for update using (auth.uid() = host_id);
create policy "sessions_delete_host"  on public.sessions for delete using (auth.uid() = host_id);

-- session_participants
create policy "sp_select_all"   on public.session_participants for select using (true);
create policy "sp_insert_auth"  on public.session_participants for insert with check (auth.uid() = user_id);
create policy "sp_delete_own"   on public.session_participants for delete using (auth.uid() = user_id);

-- reviews
create policy "reviews_select_all"   on public.reviews for select using (true);
create policy "reviews_insert_auth"  on public.reviews for insert with check (auth.uid() = author_id);
create policy "reviews_update_own"   on public.reviews for update using (auth.uid() = author_id);
create policy "reviews_delete_own"   on public.reviews for delete using (auth.uid() = author_id);

-- review_likes
create policy "rl_select_all"   on public.review_likes for select using (true);
create policy "rl_insert_auth"  on public.review_likes for insert with check (auth.uid() = user_id);
create policy "rl_delete_own"   on public.review_likes for delete using (auth.uid() = user_id);

-- ============================================================
-- 트리거: 신규 회원 → profiles 자동 생성
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 트리거: 모임 참여 → current_participants, session_count 갱신
-- ============================================================
create or replace function public.handle_participant_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_question_id uuid;
begin
  if tg_op = 'INSERT' then
    update public.sessions
      set current_participants = current_participants + 1
      where id = new.session_id;

    select question_id into v_question_id from public.sessions where id = new.session_id;
    update public.questions
      set participant_total = participant_total + 1
      where id = v_question_id;

    update public.profiles
      set session_count = session_count + 1
      where id = new.user_id;

  elsif tg_op = 'DELETE' then
    update public.sessions
      set current_participants = greatest(current_participants - 1, 0)
      where id = old.session_id;

    select question_id into v_question_id from public.sessions where id = old.session_id;
    update public.questions
      set participant_total = greatest(participant_total - 1, 0)
      where id = v_question_id;

    update public.profiles
      set session_count = greatest(session_count - 1, 0)
      where id = old.user_id;
  end if;
  return null;
end;
$$;

create trigger on_participant_change
  after insert or delete on public.session_participants
  for each row execute procedure public.handle_participant_change();

-- ============================================================
-- 트리거: 세션 생성 → question.session_count 갱신
-- ============================================================
create or replace function public.handle_session_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.questions set session_count = session_count + 1 where id = new.question_id;
  elsif tg_op = 'DELETE' then
    update public.questions set session_count = greatest(session_count - 1, 0) where id = old.question_id;
  end if;
  return null;
end;
$$;

create trigger on_session_change
  after insert or delete on public.sessions
  for each row execute procedure public.handle_session_change();

-- ============================================================
-- 트리거: 좋아요 → reviews.likes 갱신
-- ============================================================
create or replace function public.handle_like_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.reviews set likes = likes + 1 where id = new.review_id;
  elsif tg_op = 'DELETE' then
    update public.reviews set likes = greatest(likes - 1, 0) where id = old.review_id;
  end if;
  return null;
end;
$$;

create trigger on_like_change
  after insert or delete on public.review_likes
  for each row execute procedure public.handle_like_change();

-- ============================================================
-- Storage 버킷 (이미지/영상 후기)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('review-media', 'review-media', true)
on conflict do nothing;

create policy "review_media_select" on storage.objects
  for select using (bucket_id = 'review-media');

create policy "review_media_insert" on storage.objects
  for insert with check (bucket_id = 'review-media' and auth.role() = 'authenticated');

create policy "review_media_delete" on storage.objects
  for delete using (bucket_id = 'review-media' and auth.uid()::text = (storage.foldername(name))[1]);
