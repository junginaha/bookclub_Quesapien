-- ============================================================
-- Migration 004: 위치 기반 + 리더 기능 확장
-- ============================================================

-- ── 1. landing_book_clubs에 위경도 컬럼 추가 ─────────────────
ALTER TABLE landing_book_clubs
  ADD COLUMN IF NOT EXISTS lat  DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng  DOUBLE PRECISION;

-- 기존 6개 북클럽에 좌표 업데이트 (서울)
UPDATE landing_book_clubs SET lat = 37.4930, lng = 127.0151 WHERE slug = '최신간-북토크';
UPDATE landing_book_clubs SET lat = 37.4946, lng = 127.0209 WHERE slug = '다정함의-발명';
UPDATE landing_book_clubs SET lat = 37.5492, lng = 126.9148 WHERE slug = '혼자라는-감각';
UPDATE landing_book_clubs SET lat = 37.5344, lng = 127.0049 WHERE slug = '아무도-보지-않는-오후';
UPDATE landing_book_clubs SET lat = 37.5921, lng = 126.9602 WHERE slug = '오늘-저녁-당신께';
UPDATE landing_book_clubs SET lat = 37.5558, lng = 126.9073 WHERE slug = '인간이라는-풍경';

-- ── 2. 리더 역할 구분 컬럼 ──────────────────────────────────
ALTER TABLE landing_book_clubs
  ADD COLUMN IF NOT EXISTS is_leader_only BOOLEAN NOT NULL DEFAULT false;
-- is_leader_only=true: 리더 전용 기능(신청 링크 관리 등)

-- ── 3. RLS 업데이트 — host는 자신의 club만 수정 가능 ─────────
-- (기존 정책이 있으면 이미 처리됨, 없으면 추가)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'landing_book_clubs' AND policyname = 'Host can update own club'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Host can update own club"
        ON landing_book_clubs FOR UPDATE
        USING (
          auth.uid() = host_id
          OR auth.uid() = created_by
        );
    $policy$;
  END IF;
END $$;
