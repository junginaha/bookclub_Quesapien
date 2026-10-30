-- ============================================================
-- Migration 026: 유료 모임 결제 확인 기록
-- ============================================================
-- 지금까지 유료 모임도 **결제 전에** bookclub_applications에 status='confirmed'로
-- 저장됐고, 결제 여부를 기록하는 곳이 아무 데도 없었다. 그래서
--   · 결제하지 않은 사람이 자리를 차지하고
--   · 운영자는 사이트만 봐서는 누가 냈는지 알 수 없었다(PayApp 대시보드를 따로 봐야 했다).
--
-- 이 마이그레이션은 **기록할 칸만** 만든다. 예약 확정 시점(결제 전/후)을 바꾸는 것은
-- 정원·대기열·환불 로직이 전부 얽혀 있어 별도 결정 사항으로 남긴다.
--
-- 안전성: 기존 컬럼·데이터를 건드리지 않는 ADD COLUMN IF NOT EXISTS만. 재실행 안전.

ALTER TABLE public.bookclub_applications
  -- 결제 완료 시각. NULL이면 아직 확인되지 않은 것(무료 모임도 NULL).
  ADD COLUMN IF NOT EXISTS paid_at      TIMESTAMPTZ,
  -- PayApp 결제요청번호(mul_no) — 취소·대사(對査)에 쓴다. 중복 통보 방지용 키이기도 하다.
  ADD COLUMN IF NOT EXISTS payment_ref  TEXT,
  -- PayApp pay_state 원값(4 결제완료 / 9·64 승인취소 / 10 입금대기 등)을 그대로 남긴다.
  -- 뜻을 해석해 저장하면 나중에 PayApp이 값을 늘렸을 때 사실이 뭉개진다.
  ADD COLUMN IF NOT EXISTS payment_state TEXT;

-- 같은 mul_no로 두 번 통보가 와도 한 줄만 갱신되도록(PayApp은 재시도한다).
CREATE INDEX IF NOT EXISTS bookclub_applications_payment_ref_idx
  ON public.bookclub_applications (payment_ref)
  WHERE payment_ref IS NOT NULL;

-- 결제 확인된 신청만 빠르게 세기 위한 보조 인덱스.
CREATE INDEX IF NOT EXISTS bookclub_applications_paid_idx
  ON public.bookclub_applications (club_slug, paid_at)
  WHERE paid_at IS NOT NULL;
