-- ============================================================
-- Quesapience 2.0 — C0. 기술 기반 설정
-- extensions + KPI 이벤트 테이블 (§B4)
-- ============================================================

create extension if not exists postgis;
create extension if not exists vector;

create table public.events (
  id bigint generated always as identity primary key,
  user_id uuid,                    -- 비로그인은 null
  name text not null,              -- signup | attend_apply | archive_view | archive_to_apply | order_paid ...
  props jsonb,
  created_at timestamptz not null default now()
);

create index events_name_created_at_idx on public.events (name, created_at desc);
create index events_user_id_idx on public.events (user_id);

alter table public.events enable row level security;

-- 누구나(비로그인 포함) 이벤트를 기록할 수 있다 — 계측이 로그인 여부에 좌우되면 안 됨.
create policy "events_insert_anyone" on public.events
  for insert with check (true);

-- 조회(select) 정책은 일부러 여기서 만들지 않는다: profiles.is_operator 컬럼이
-- 아직 존재하지 않기 때문(다음 마이그레이션 009_profiles_v2.sql에서 추가됨).
-- RLS가 켜져 있고 select 정책이 없으므로 이 시점에는 service_role만 조회 가능하며,
-- 009에서 is_operator 컬럼 추가 직후 "events_select_operator" 정책을 붙인다.
