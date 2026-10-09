-- ============================================================
-- Migration 023: "다시 함께 읽어요" 앵콜 신청 — 슬러그 기반 + 실제 연락처
-- ============================================================
-- 배경
--  1) 홈/북클럽 화면의 세션 데이터는 src/lib/bookclub/data.ts(영문 slug)가 단일
--     출처다. 기존 앵콜 요청은 landing_book_clubs.id(UUID)에 묶여 있어 slug만 있는
--     세션은 404가 났다 → club_slug 기준으로 저장한다(bookclub_applications와 동일).
--  2) 기존 구조는 연락처를 sha256 해시로만 저장해 "5명 모이면 알려드려요"를
--     실제로 실행할 방법이 없었다 → 동의를 받은 연락처 원문과 희망 연락 채널
--     (이메일/문자/전화)을 저장한다. 원문은 서비스 롤(운영자 API)에서만 읽는다.
--
-- 안전성: 전부 ADD COLUMN IF NOT EXISTS / CREATE ... IF NOT EXISTS / DROP NOT NULL.
-- 기존 행·데이터 삭제 없음. 여러 번 실행해도 안전하다.

-- 011이 적용되지 않은 DB에서도 단독 실행되도록 테이블을 먼저 보장한다.
CREATE TABLE IF NOT EXISTS public.landing_book_club_encore_requests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id               UUID,
  user_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_method        TEXT,
  contact_hash          TEXT,
  privacy_consented_at  TIMESTAMPTZ,
  preferred_area        TEXT,
  preferred_time        TEXT,
  participation_intent  TEXT,
  status                TEXT NOT NULL DEFAULT 'active',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_book_club_encore_requests
  ALTER COLUMN club_id DROP NOT NULL;

ALTER TABLE public.landing_book_club_encore_requests
  ADD COLUMN IF NOT EXISTS club_slug       TEXT,
  ADD COLUMN IF NOT EXISTS contact_name    TEXT,
  ADD COLUMN IF NOT EXISTS contact_value   TEXT,
  ADD COLUMN IF NOT EXISTS notify_channel  TEXT;

-- contact_method 체크 제약(email/phone)을 sms/call까지 허용하도록 교체.
ALTER TABLE public.landing_book_club_encore_requests
  DROP CONSTRAINT IF EXISTS landing_book_club_encore_requests_contact_method_check;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'encore_notify_channel_check'
  ) THEN
    ALTER TABLE public.landing_book_club_encore_requests
      ADD CONSTRAINT encore_notify_channel_check
      CHECK (notify_channel IS NULL OR notify_channel IN ('email', 'sms', 'call'));
  END IF;
END $$;

COMMENT ON COLUMN public.landing_book_club_encore_requests.club_slug IS
  'src/lib/bookclub/data.ts 세션 slug. 신규 요청은 club_id 대신 이 값으로 묶는다.';
COMMENT ON COLUMN public.landing_book_club_encore_requests.contact_value IS
  '개인정보 수집·이용 동의를 받은 연락처 원문(이메일 또는 전화번호). 서비스 롤 전용, 재개설 안내 후 파기.';
COMMENT ON COLUMN public.landing_book_club_encore_requests.notify_channel IS
  '희망 연락 방식: email | sms(문자) | call(전화).';

-- 중복 방지: 같은 slug에 같은 연락처(해시)/같은 회원의 활성 요청은 1건.
CREATE UNIQUE INDEX IF NOT EXISTS encore_unique_slug_contact
  ON public.landing_book_club_encore_requests (club_slug, contact_hash)
  WHERE club_slug IS NOT NULL AND contact_hash IS NOT NULL AND status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS encore_unique_slug_user
  ON public.landing_book_club_encore_requests (club_slug, user_id)
  WHERE club_slug IS NOT NULL AND user_id IS NOT NULL AND status = 'active';

CREATE INDEX IF NOT EXISTS encore_club_slug_idx
  ON public.landing_book_club_encore_requests (club_slug) WHERE status = 'active';

ALTER TABLE public.landing_book_club_encore_requests ENABLE ROW LEVEL SECURITY;

-- 연락처 원문은 anon/authenticated 어느 쪽에도 컬럼 단위로 노출하지 않는다
-- (기존 "본인 요청 조회" 정책이 있어도 원문 컬럼은 읽을 수 없다).
REVOKE SELECT (contact_value, contact_hash) ON public.landing_book_club_encore_requests FROM anon, authenticated;

-- 공개 집계: slug별 활성 요청 수만(개인 식별 정보 없음).
CREATE OR REPLACE VIEW public.bookclub_encore_counts AS
  SELECT club_slug, count(*)::int AS encore_count
  FROM public.landing_book_club_encore_requests
  WHERE status = 'active' AND club_slug IS NOT NULL
  GROUP BY club_slug;

-- 기준 인원 도달 시 운영자 알림을 한 번만 보내기 위한 기록.
CREATE TABLE IF NOT EXISTS public.bookclub_encore_rounds (
  club_slug             TEXT PRIMARY KEY,
  operator_notified_at  TIMESTAMPTZ,
  notified_count        INTEGER
);
ALTER TABLE public.bookclub_encore_rounds ENABLE ROW LEVEL SECURITY;
-- 정책 없음 = 서비스 롤 전용.
