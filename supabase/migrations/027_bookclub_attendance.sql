-- ============================================================
-- Migration 027: 출석 기록
-- ============================================================
-- 지금까지 bookclub_applications에는 confirmed/canceled뿐이라 **누가 실제로 왔는지**
-- 를 적을 곳이 없었다. 그래서 세 가지를 못 만들고 있었다.
--   · 재참여율 (리더 중심 전환 같은 판단의 근거)
--   · "지난 모임에 N명이 오셨어요" (노쇼를 가장 크게 줄이는 규범 신호)
--   · 출석 연동 환급·시즌권
--
-- 두 칸을 따로 둔다. 둘 다 NULL이면 **"아직 확인 안 함"**이고, 그것은 노쇼와 다르다.
-- 불리언 하나로 두면 '확인 안 함'과 '안 옴'이 구별되지 않아 집계가 거짓말을 한다.
--
-- 안전성: ADD COLUMN IF NOT EXISTS만. 기존 컬럼·데이터를 건드리지 않는다. 재실행 안전.

ALTER TABLE public.bookclub_applications
  -- 참석 확인 시각. NULL이면 참석으로 기록되지 않은 것.
  ADD COLUMN IF NOT EXISTS attended_at  TIMESTAMPTZ,
  -- 노쇼로 표시한 시각. 참석과 동시에 설정되지 않는다(둘 중 하나만).
  ADD COLUMN IF NOT EXISTS no_show_at   TIMESTAMPTZ;

-- 참석자만 빠르게 세기 위한 보조 인덱스.
CREATE INDEX IF NOT EXISTS bookclub_applications_attended_idx
  ON public.bookclub_applications (club_slug, attended_at)
  WHERE attended_at IS NOT NULL;

-- 재참여 집계는 번호 기준이다(이 테이블에 user_id가 없다).
CREATE INDEX IF NOT EXISTS bookclub_applications_phone_attended_idx
  ON public.bookclub_applications (phone)
  WHERE attended_at IS NOT NULL;
