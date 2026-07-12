-- ============================================================
-- Migration 011: 북클럽 지금/앵콜 재구조화
-- ============================================================
-- ⚠ 이 저장소의 실행 환경은 라이브 Supabase 프로젝트에 대한 아웃바운드 네트워크
-- 접근이 없다(CLAUDE.md에 이미 기록됨) — 이 마이그레이션은 코드로 작성만 됐고
-- 아직 적용되지 않았다. 운영자가 Supabase 대시보드 SQL 에디터에 그대로 붙여넣어
-- 실행해야 한다. 전부 IF NOT EXISTS/ADD COLUMN 패턴이라 여러 번 실행해도 안전하다.

-- ── 1. landing_book_clubs — 구조화된 일정·지역·앵콜 컬럼 추가 ──────
-- (schedule 자유 텍스트는 그대로 둔다 — 과거 표시용으로 유지, 새 코드는
--  event_starts_at을 우선 사용하고 없으면 schedule을 파싱해서 대체한다.)
ALTER TABLE landing_book_clubs
  ADD COLUMN IF NOT EXISTS event_starts_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS event_ends_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS registration_closes_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS area                    TEXT,
  ADD COLUMN IF NOT EXISTS price                   NUMERIC,
  ADD COLUMN IF NOT EXISTS author_hosts            BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS encore_eligible          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS encore_threshold         INTEGER NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS archived_at              TIMESTAMPTZ;

COMMENT ON COLUMN landing_book_clubs.event_starts_at IS
  '실제 모임 시작 시각(UTC 저장, Asia/Seoul로 표시). 있으면 schedule 텍스트보다 우선.';
COMMENT ON COLUMN landing_book_clubs.encore_eligible IS
  '지금 신청은 닫혔지만 앵콜 요청을 받아 재오픈 후보가 되는가.';
COMMENT ON COLUMN landing_book_clubs.archived_at IS
  '지금 함께 읽어요에서 다시 함께 읽어요로 넘어간 시각(자동 전환 기록용).';

-- ── 2. 앵콜 요청 테이블 ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS landing_book_club_encore_requests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id               UUID NOT NULL REFERENCES landing_book_clubs(id) ON DELETE CASCADE,
  user_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_method        TEXT CHECK (contact_method IN ('email', 'phone')),
  contact_hash          TEXT,          -- sha256(lower(trim(연락처))) — 원문 미저장
  privacy_consented_at  TIMESTAMPTZ,
  preferred_area        TEXT,
  preferred_time        TEXT,
  participation_intent  TEXT,
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT encore_requires_identity CHECK (user_id IS NOT NULL OR contact_hash IS NOT NULL)
);

-- 로그인 사용자는 클럽당 1건, 게스트는 (클럽, 연락처 해시)당 1건 — 중복 방지.
-- status='canceled'로 남기고 새로 신청할 수 있도록 활성(active) 건에만 유니크 제약을 건다.
CREATE UNIQUE INDEX IF NOT EXISTS encore_unique_user
  ON landing_book_club_encore_requests (club_id, user_id)
  WHERE user_id IS NOT NULL AND status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS encore_unique_contact
  ON landing_book_club_encore_requests (club_id, contact_hash)
  WHERE contact_hash IS NOT NULL AND status = 'active';

CREATE INDEX IF NOT EXISTS encore_club_id_idx ON landing_book_club_encore_requests (club_id);

ALTER TABLE landing_book_club_encore_requests ENABLE ROW LEVEL SECURITY;

-- 본인 신청 내역만 조회 가능(로그인 사용자). 게스트 조회/집계/취소는 서비스
-- 롤(service role)로 서버 API에서만 처리 — 원문 연락처를 클라이언트에 노출하지 않는다.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'landing_book_club_encore_requests' AND policyname = 'Users can view own encore requests'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can view own encore requests"
        ON landing_book_club_encore_requests FOR SELECT
        USING (auth.uid() = user_id);
    $policy$;
  END IF;
END $$;

-- 클럽별 앵콜 요청 집계는 공개 뷰로 (개수만, 개인 식별 정보 없음).
CREATE OR REPLACE VIEW landing_book_club_encore_counts AS
  SELECT club_id, count(*) AS encore_request_count
  FROM landing_book_club_encore_requests
  WHERE status = 'active'
  GROUP BY club_id;
