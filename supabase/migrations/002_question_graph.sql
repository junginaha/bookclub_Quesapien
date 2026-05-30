-- ============================================================
-- Stage 8: Question Graph 확장 스키마
-- 목적: 현재 기능을 유지하면서, 향후 Question/Book/Giant 관계 그래프
--       구축을 위한 기반 테이블 추가
-- 기존 테이블/RLS는 절대 변경하지 않음
-- ============================================================

-- ─── 1. books (도서 독립 테이블) ─────────────────────────────
-- 기존: landing_book_clubs.title + author 에 비정규화됨
-- 목적: 책을 독립 엔티티로 관리 → 북토크/리뷰/질문에서 참조 가능
create table if not exists public.books (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  author      text not null,
  publisher   text,
  published_year int,
  genre       text,
  isbn        text unique,
  cover_url   text,
  description text,
  tags        text[] not null default '{}',
  -- SEO/AEO 필드
  schema_type text not null default 'Book',  -- Schema.org type
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── 2. giants (사유자/저자 독립 테이블) ─────────────────────
-- 기존: GiantsClient.tsx 에 하드코딩
-- 목적: DB로 이관 시 확장성 확보, RAG 연동 준비
create table if not exists public.giants (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  name_en       text not null,
  birth_year    int,
  death_year    int,
  nationality   text,
  category      text not null check (category in ('philosopher','author','scientist','thinker','entrepreneur')),
  tagline       text,
  core_idea     text,
  signature_quote text,
  color         text not null default '#2D3748',
  -- RAG 확장을 위한 필드
  rag_enabled   boolean not null default false,
  vector_namespace text,  -- pgvector 네임스페이스 (e.g. 'nietzsche-works')
  created_at    timestamptz not null default now()
);

-- ─── 3. giant_works (저서 목록) ──────────────────────────────
create table if not exists public.giant_works (
  id        uuid primary key default gen_random_uuid(),
  giant_id  uuid not null references public.giants(id) on delete cascade,
  title     text not null,
  book_id   uuid references public.books(id),  -- books 테이블 연결 (선택)
  sort_order int not null default 0
);

-- ─── 4. question_relations (질문 간 관계 그래프) ──────────────
-- 목적: Question Graph의 핵심. 질문 → 질문 edge
-- 향후 AI 기반 관련 질문 추천에 사용
create table if not exists public.question_relations (
  id              uuid primary key default gen_random_uuid(),
  source_id       uuid not null,  -- landing_questions.id 참조 (FK 없이 유연하게)
  target_id       uuid not null,
  relation_type   text not null check (
    relation_type in (
      'related',      -- 관련 질문
      'opposite',     -- 반대 질문
      'deepening',    -- 심화 질문
      'prerequisite'  -- 선행 질문
    )
  ),
  weight          float not null default 1.0,  -- 관련도 (0~1)
  created_by      text not null default 'system',  -- 'ai' | 'user' | 'system'
  created_at      timestamptz not null default now(),
  unique (source_id, target_id, relation_type)
);

-- ─── 5. content_links (콘텐츠 간 내부 링크) ─────────────────
-- 목적: Stage 5 내부 링크 최적화의 DB 기반
-- question ↔ booktalk, giant ↔ question, book ↔ review 연결
create table if not exists public.content_links (
  id            uuid primary key default gen_random_uuid(),
  from_type     text not null,  -- 'question' | 'booktalk' | 'giant' | 'book' | 'review'
  from_id       text not null,
  to_type       text not null,
  to_id         text not null,
  relation      text not null,  -- 'about' | 'references' | 'inspired_by' | 'discussed_in'
  created_at    timestamptz not null default now(),
  unique (from_type, from_id, to_type, to_id, relation)
);

-- ─── 6. knowledge_nodes (지식 노드 = Question Graph 정점) ──────
-- 목적: 질문/책/저자/리뷰/북토크를 하나의 그래프로 통합
-- 향후 pgvector + similarity search 기반
create table if not exists public.knowledge_nodes (
  id            uuid primary key default gen_random_uuid(),
  node_type     text not null check (
    node_type in ('question','book','giant','review','booktalk','concept')
  ),
  external_id   text not null,   -- 원본 테이블의 id
  title         text not null,   -- 검색/표시용
  summary       text,            -- AI 생성 요약
  tags          text[] not null default '{}',
  -- pgvector 확장 시 사용 (현재 비활성)
  -- embedding   vector(1536),
  created_at    timestamptz not null default now(),
  unique (node_type, external_id)
);

-- ─── 7. page_seo_meta (페이지별 SEO 메타 오버라이드) ──────────
-- 목적: 관리자가 특정 페이지의 SEO 메타를 DB에서 관리
-- Next.js generateMetadata가 이 테이블을 우선 참조
create table if not exists public.page_seo_meta (
  id              uuid primary key default gen_random_uuid(),
  path            text not null unique,  -- e.g. '/bookclub/다정함의-발명'
  title           text,
  description     text,
  og_image_url    text,
  ai_summary_what text,   -- Stage 3 AISummaryBlock
  ai_summary_why  text,
  ai_summary_who  text,
  definition      text,   -- Stage 4 DefinitionBlock
  json_ld         jsonb,  -- 커스텀 JSON-LD override
  updated_at      timestamptz not null default now()
);

-- ─── RLS 활성화 (모두 공개 읽기, 관리자만 쓰기) ─────────────
alter table public.books              enable row level security;
alter table public.giants             enable row level security;
alter table public.giant_works        enable row level security;
alter table public.question_relations enable row level security;
alter table public.content_links      enable row level security;
alter table public.knowledge_nodes    enable row level security;
alter table public.page_seo_meta      enable row level security;

-- 공개 읽기 정책
create policy "books_select_all"              on public.books              for select using (true);
create policy "giants_select_all"             on public.giants             for select using (true);
create policy "giant_works_select_all"        on public.giant_works        for select using (true);
create policy "question_relations_select_all" on public.question_relations for select using (true);
create policy "content_links_select_all"      on public.content_links      for select using (true);
create policy "knowledge_nodes_select_all"    on public.knowledge_nodes    for select using (true);
create policy "page_seo_meta_select_all"      on public.page_seo_meta      for select using (true);

-- ─── 인덱스 ──────────────────────────────────────────────────
create index if not exists idx_question_relations_source on public.question_relations (source_id);
create index if not exists idx_question_relations_target on public.question_relations (target_id);
create index if not exists idx_content_links_from       on public.content_links (from_type, from_id);
create index if not exists idx_content_links_to         on public.content_links (to_type, to_id);
create index if not exists idx_knowledge_nodes_type     on public.knowledge_nodes (node_type);
create index if not exists idx_page_seo_meta_path       on public.page_seo_meta (path);
create index if not exists idx_giants_slug              on public.giants (slug);

-- ─── 코멘트 (문서화) ─────────────────────────────────────────
comment on table public.books              is 'Stage 8: 도서 독립 엔티티. 북토크/리뷰/질문에서 참조.';
comment on table public.giants             is 'Stage 8: 사유자/저자. GiantsClient.tsx 하드코딩을 DB로 이관 시 사용.';
comment on table public.question_relations is 'Stage 8: Question Graph 핵심. 질문 간 관계 엣지.';
comment on table public.content_links      is 'Stage 5+8: 콘텐츠 내부 링크 그래프.';
comment on table public.knowledge_nodes    is 'Stage 8: 모든 콘텐츠 타입을 통합하는 지식 노드. pgvector 확장 준비.';
comment on table public.page_seo_meta      is 'Stage 1-4: DB 기반 SEO 메타 관리. Next.js generateMetadata와 연동 가능.';
