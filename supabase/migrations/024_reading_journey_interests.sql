-- ============================================================
-- Migration 024: 독서여행(reading journey) 참여 의향 · 관심 표시
-- ============================================================
-- 2026→2027 은하수 히치하이커 독서여행의 "참여 의향 남기기"(journey)와
-- "조용히 읽는 모임 관심 표시"(quiet)를 실제로 저장한다.
-- 일정·장소·참가비가 확정되기 전이라 '예약/신청 확정'이 아니라 '의향'만 받는다.
-- 정식 신청은 확정 후 기존 bookclub_applications(021) 흐름으로 연다.
--
-- 안전성: 신규 테이블·뷰만 생성(IF NOT EXISTS). 기존 데이터 변경 없음.

CREATE TABLE IF NOT EXISTS public.reading_journey_interests (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_slug          TEXT NOT NULL,
  kind                  TEXT NOT NULL CHECK (kind IN ('journey', 'quiet')),
  user_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notify_channel        TEXT NOT NULL CHECK (notify_channel IN ('email', 'sms', 'call')),
  contact_value         TEXT NOT NULL,
  contact_hash          TEXT NOT NULL,
  contact_name          TEXT,
  privacy_consented_at  TIMESTAMPTZ NOT NULL,
  status                TEXT NOT NULL DEFAULT 'interested'
                        CHECK (status IN ('interested', 'applied', 'confirmed', 'canceled')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.reading_journey_interests IS
  '독서여행 참여 의향/관심 표시. status: interested(의향) → applied(정식 신청) → confirmed(참가 확정). 연락처 원문은 서비스 롤 전용.';

CREATE UNIQUE INDEX IF NOT EXISTS reading_journey_interest_unique
  ON public.reading_journey_interests (journey_slug, kind, contact_hash)
  WHERE status <> 'canceled';

CREATE INDEX IF NOT EXISTS reading_journey_interest_slug_idx
  ON public.reading_journey_interests (journey_slug, kind) WHERE status <> 'canceled';

ALTER TABLE public.reading_journey_interests ENABLE ROW LEVEL SECURITY;
-- 정책 없음 = anon/authenticated 직접 접근 불가. 저장·조회는 서버 API(서비스 롤)만.
REVOKE ALL ON public.reading_journey_interests FROM anon, authenticated;

-- 공개 집계: 종류별 인원 수만(개인 식별 정보 없음).
CREATE OR REPLACE VIEW public.reading_journey_interest_counts AS
  SELECT journey_slug, kind, count(*)::int AS interest_count
  FROM public.reading_journey_interests
  WHERE status <> 'canceled'
  GROUP BY journey_slug, kind;
