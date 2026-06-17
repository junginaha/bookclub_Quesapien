-- ============================================================
-- 19호실 출판OS — 데이터베이스 스키마
-- ============================================================

-- 출판 프로젝트
create table if not exists public.publishing_books (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  title           text not null default '제목 없음',
  subtitle        text,
  author          text not null default '',
  publisher       text not null default '19호실',
  isbn            text,
  publish_date    date,
  price           int,
  copyright_text  text,
  publisher_bio   text,
  status          text not null default '집필중'
                    check (status in ('집필중', '편집중', '검수중', '출판완료')),
  cover_url       text,
  back_cover_url  text,
  page_size       text not null default 'A5'
                    check (page_size in ('A5', '신국판', '국판')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 원고 파일
create table if not exists public.publishing_manuscripts (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references public.publishing_books(id) on delete cascade,
  file_name   text not null,
  file_url    text not null,
  file_type   text not null check (file_type in ('docx', 'txt', 'md')),
  raw_content text,
  parsed_at   timestamptz,
  created_at  timestamptz not null default now()
);

-- 파싱된 챕터/섹션 구조
create table if not exists public.publishing_chapters (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references public.publishing_books(id) on delete cascade,
  parent_id   uuid references public.publishing_chapters(id) on delete cascade,
  level       int not null default 1,  -- 1=챕터, 2=섹션, 3=서브섹션
  order_index int not null default 0,
  title       text not null,
  content     text,
  page_number int,
  created_at  timestamptz not null default now()
);

-- 조판 설정
create table if not exists public.publishing_layouts (
  id                  uuid primary key default gen_random_uuid(),
  book_id             uuid not null unique references public.publishing_books(id) on delete cascade,
  -- 여백 (mm)
  margin_top          float not null default 25,
  margin_bottom       float not null default 25,
  margin_inner        float not null default 25,
  margin_outer        float not null default 20,
  -- 폰트
  body_font           text not null default 'Noto Serif KR',
  heading_font        text not null default 'Noto Sans KR',
  body_font_size      float not null default 10.5,
  line_height         float not null default 1.8,
  -- 이미지 기본 옵션
  image_default_width text not null default 'body'
                        check (image_default_width in ('body', 'full', 'thumb', 'large')),
  -- 머리말/꼬리말
  header_enabled      boolean not null default true,
  header_text         text not null default '{chapter_title}',
  footer_enabled      boolean not null default true,
  page_number_pos     text not null default 'bottom-center'
                        check (page_number_pos in ('bottom-center', 'bottom-outer', 'bottom-inner')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 이미지
create table if not exists public.publishing_images (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references public.publishing_books(id) on delete cascade,
  chapter_id  uuid references public.publishing_chapters(id) on delete set null,
  file_name   text not null,
  file_url    text not null,
  caption     text,
  alt_text    text,
  width_type  text not null default 'body'
                check (width_type in ('body', 'full', 'thumb', 'large')),
  order_index int not null default 0,
  created_at  timestamptz not null default now()
);

-- 내보내기 이력
create table if not exists public.publishing_exports (
  id            uuid primary key default gen_random_uuid(),
  book_id       uuid not null references public.publishing_books(id) on delete cascade,
  export_type   text not null check (export_type in ('pdf', 'epub')),
  status        text not null default 'pending'
                  check (status in ('pending', 'processing', 'completed', 'failed')),
  file_url      text,
  page_count    int,
  file_size_kb  int,
  error_message text,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);

-- RLS 정책
alter table public.publishing_books enable row level security;
alter table public.publishing_manuscripts enable row level security;
alter table public.publishing_chapters enable row level security;
alter table public.publishing_layouts enable row level security;
alter table public.publishing_images enable row level security;
alter table public.publishing_exports enable row level security;

create policy "users_own_books" on public.publishing_books
  for all using (auth.uid() = user_id);

create policy "users_own_manuscripts" on public.publishing_manuscripts
  for all using (
    book_id in (select id from public.publishing_books where user_id = auth.uid())
  );

create policy "users_own_chapters" on public.publishing_chapters
  for all using (
    book_id in (select id from public.publishing_books where user_id = auth.uid())
  );

create policy "users_own_layouts" on public.publishing_layouts
  for all using (
    book_id in (select id from public.publishing_books where user_id = auth.uid())
  );

create policy "users_own_images" on public.publishing_images
  for all using (
    book_id in (select id from public.publishing_books where user_id = auth.uid())
  );

create policy "users_own_exports" on public.publishing_exports
  for all using (
    book_id in (select id from public.publishing_books where user_id = auth.uid())
  );

-- updated_at 트리거
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger publishing_books_updated_at
  before update on public.publishing_books
  for each row execute function public.set_updated_at();

create trigger publishing_layouts_updated_at
  before update on public.publishing_layouts
  for each row execute function public.set_updated_at();
