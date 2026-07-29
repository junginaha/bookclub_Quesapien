-- ============================================================
-- Migration 018: is_mini 컬럼 기본값·백필
-- ============================================================
-- ⚠ 이 저장소의 실행 환경은 라이브 Supabase 프로젝트에 대한 아웃바운드 네트워크
-- 접근이 없다(기존 마이그레이션들과 동일 제약) — 운영자가 Supabase 대시보드
-- SQL 에디터에 그대로 붙여넣어 실행해야 한다. 멱등적이라 여러 번 실행해도 안전하다.
--
-- 배경: `/api/book-clubs?mini=false`가 `.eq("is_mini", false)`로 필터링하는데,
-- 016_real_clubs_and_seed_flag.sql의 실제 클럽 INSERT는 is_mini를 세팅하지 않아
-- 해당 행들이 is_mini = NULL로 남았다. Postgres에서 `NULL = false`는 NULL(거짓
-- 취급)이라 이 행들이 "지금 함께 읽어요"(홈)에서 통째로 걸러졌다 — 홈이 항상
-- 비어 보이던 근본 원인. 코드 쪽은 이미 NULL을 안전하게 처리하도록 고쳤지만
-- (src/app/api/book-clubs/route.ts), 컬럼 자체도 기본값을 갖도록 맞춘다.

ALTER TABLE landing_book_clubs
  ADD COLUMN IF NOT EXISTS is_mini BOOLEAN;

UPDATE landing_book_clubs
  SET is_mini = false
  WHERE is_mini IS NULL;

ALTER TABLE landing_book_clubs
  ALTER COLUMN is_mini SET DEFAULT false,
  ALTER COLUMN is_mini SET NOT NULL;
