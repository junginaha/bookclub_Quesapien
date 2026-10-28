-- 운영 DB에 빠진 것을 한 번에 적용하는 묶음 파일 (2026-10-28).
--
-- 마이그레이션 워크플로가 2026-08-02 이후 한 번도 성공하지 못해(저장소 시크릿
-- SUPABASE_ACCESS_TOKEN이 비어 있음) 021·023·024가 운영 DB에 적용되지 않았을 수 있다.
-- /api/admin/db-health 가 '빠진것'을 보고하면, 이 파일 전체를 Supabase 대시보드
-- SQL 에디터에 붙여넣고 한 번 실행하면 된다.
--
-- 세 파일 모두 재실행해도 안전하게(IF NOT EXISTS / CREATE OR REPLACE) 작성돼 있어,
-- 이미 적용된 항목이 섞여 있어도 그대로 실행하면 된다.
-- 원본은 supabase/migrations/ 아래 같은 번호의 파일이며, 이 파일은 그 복사본이다.

-- ======================================================================
-- 021_bookclub_applications.sql
-- ======================================================================
-- ============================================================
-- Migration 021: /bookclub IA 재구성 — 신청·대기자 저장
-- ============================================================
-- 이 저장소의 실행 환경은 라이브 Supabase 프로젝트에 대한 아웃바운드 네트워크
-- 접근이 없다(CLAUDE.md에 이미 기록된 기존 제약과 동일) — 운영자가 Supabase
-- 대시보드 SQL 에디터에 그대로 붙여넣어 실행해야 한다. 전부 IF NOT EXISTS/
-- OR REPLACE 패턴이라 여러 번 실행해도 안전하다.
--
-- 설계 메모:
-- - 이 마이그레이션은 기존 landing_book_clubs / landing_book_club_signups
--   (017/020)와 별개다. 신규 /bookclub은 클럽 데이터를 DB가 아니라
--   src/lib/bookclubs.ts 코드에 직접 갖고 있으므로(스펙 §B), FOR UPDATE로 잠글
--   클럽 행 자체가 없다 — 대신 club_slug 문자열에 대한 세션 어드바이저리 락으로
--   동시 신청을 직렬화한다.
-- - capacity(정원)는 이 DB에 없다 — 서버 액션이 src/lib/bookclubs.ts에서 읽어
--   RPC 인자로 넘긴다. RPC는 그 값과 현재 확정 신청 수를 비교해 정원 초과 시
--   자동으로 대기자로 전환한다(클라이언트 숫자로 판단하지 않음, §C-1).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── 1. 신청 테이블 ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookclub_applications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_slug   TEXT NOT NULL,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,  -- 숫자만 정규화해서 저장(하이픈 등 제거) — 유니크 판정용
  email       TEXT,
  note        TEXT,
  status      TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'canceled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookclub_applications_slug_idx
  ON public.bookclub_applications (club_slug, status);

-- club_slug + phone 유니크(활성 신청 기준) — 스펙 §C-1 "중복 방지".
CREATE UNIQUE INDEX IF NOT EXISTS bookclub_applications_slug_phone_uidx
  ON public.bookclub_applications (club_slug, phone)
  WHERE status = 'confirmed';

ALTER TABLE public.bookclub_applications ENABLE ROW LEVEL SECURITY;

-- 이름·연락처 원문이 있는 테이블 — 공개 정책 없음. service_role만 접근.
REVOKE ALL ON TABLE public.bookclub_applications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.bookclub_applications TO service_role;

-- ── 2. 대기자/알림 테이블 ────────────────────────────────────
-- club_slug가 NULL이면 "새 모임 열릴 때 안내"(사이드바 전체 알림).
CREATE TABLE IF NOT EXISTS public.bookclub_waitlist (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_slug    TEXT,
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS bookclub_waitlist_slug_idx
  ON public.bookclub_waitlist (club_slug);

-- club_slug + phone 유니크. club_slug가 NULL인 행끼리도 phone 기준 중복을 막기
-- 위해 coalesce로 빈 문자열과 동일 취급한다(NULL은 유니크 인덱스에서 서로 다른
-- 값으로 취급되므로 그대로 두면 같은 번호로 여러 번 "알림 받기"가 쌓인다).
CREATE UNIQUE INDEX IF NOT EXISTS bookclub_waitlist_slug_phone_uidx
  ON public.bookclub_waitlist (COALESCE(club_slug, ''), phone);

ALTER TABLE public.bookclub_waitlist ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.bookclub_waitlist FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.bookclub_waitlist TO service_role;

-- ── 3. 신청 RPC — 정원 재검증 + 초과 시 자동 대기자 전환 ────────
CREATE OR REPLACE FUNCTION public.apply_to_bookclub(
  p_club_slug TEXT,
  p_capacity  INTEGER,
  p_name      TEXT,
  p_phone     TEXT,
  p_email     TEXT,
  p_note      TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_phone     TEXT;
  v_confirmed INTEGER;
  v_existing  UUID;
BEGIN
  v_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');

  IF p_club_slug IS NULL OR btrim(p_club_slug) = ''
     OR p_name IS NULL OR btrim(p_name) = '' OR char_length(btrim(p_name)) > 80
     OR v_phone = '' OR char_length(v_phone) < 9 OR char_length(v_phone) > 15
     OR p_capacity IS NULL OR p_capacity < 1 THEN
    RAISE EXCEPTION USING MESSAGE = 'invalid_input', ERRCODE = 'P0001';
  END IF;

  -- 같은 club_slug에 대한 동시 신청을 직렬화한다. clubs 테이블 행이 없으므로
  -- 어드바이저리 락으로 대체(트랜잭션 종료 시 자동 해제).
  PERFORM pg_advisory_xact_lock(hashtext(p_club_slug));

  SELECT id INTO v_existing
  FROM public.bookclub_applications
  WHERE club_slug = p_club_slug AND phone = v_phone AND status = 'confirmed';

  IF FOUND THEN
    RETURN jsonb_build_object('kind', 'duplicate');
  END IF;

  SELECT count(*)::INTEGER INTO v_confirmed
  FROM public.bookclub_applications
  WHERE club_slug = p_club_slug AND status = 'confirmed';

  IF v_confirmed < p_capacity THEN
    INSERT INTO public.bookclub_applications (club_slug, name, phone, email, note, status)
    VALUES (p_club_slug, btrim(p_name), v_phone, nullif(btrim(coalesce(p_email, '')), ''), nullif(btrim(coalesce(p_note, '')), ''), 'confirmed');
    RETURN jsonb_build_object('kind', 'confirmed');
  ELSE
    -- 방금 마감된 경우 — 신청이 아니라 대기자로 저장한다(클라이언트 숫자로
    -- 판단하지 않고 서버가 재검증한 결과).
    INSERT INTO public.bookclub_waitlist (club_slug, name, phone)
    VALUES (p_club_slug, btrim(p_name), v_phone)
    ON CONFLICT (COALESCE(club_slug, ''), phone) DO NOTHING;
    RETURN jsonb_build_object('kind', 'just_filled_waitlisted');
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.apply_to_bookclub(TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_to_bookclub(TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT)
  TO service_role;

-- ── 4. 대기자/알림 등록 RPC (이미 마감·책 선정 중·전체 알림) ──────
CREATE OR REPLACE FUNCTION public.join_bookclub_waitlist(
  p_club_slug TEXT, -- NULL이면 전체 알림
  p_name      TEXT,
  p_phone     TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_phone TEXT;
  v_existing UUID;
BEGIN
  v_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');

  IF p_name IS NULL OR btrim(p_name) = '' OR char_length(btrim(p_name)) > 80
     OR v_phone = '' OR char_length(v_phone) < 9 OR char_length(v_phone) > 15 THEN
    RAISE EXCEPTION USING MESSAGE = 'invalid_input', ERRCODE = 'P0001';
  END IF;

  SELECT id INTO v_existing
  FROM public.bookclub_waitlist
  WHERE COALESCE(club_slug, '') = COALESCE(p_club_slug, '') AND phone = v_phone;

  IF FOUND THEN
    RETURN jsonb_build_object('kind', 'duplicate');
  END IF;

  INSERT INTO public.bookclub_waitlist (club_slug, name, phone)
  VALUES (p_club_slug, btrim(p_name), v_phone);

  RETURN jsonb_build_object('kind', 'joined');
END;
$function$;

REVOKE ALL ON FUNCTION public.join_bookclub_waitlist(TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.join_bookclub_waitlist(TEXT, TEXT, TEXT)
  TO service_role;

COMMIT;

-- ======================================================================
-- 023_bookclub_interest_v2.sql
-- ======================================================================
-- 023: "읽고 싶어요" 신청서 확장 — 답변 받을 방법·남기실 말·동의 시각 저장.
-- 021(bookclub_waitlist, join_bookclub_waitlist)을 전제로 하며, 전부 재실행 안전(idempotent).
BEGIN;

ALTER TABLE public.bookclub_waitlist ADD COLUMN IF NOT EXISTS contact_method TEXT;
ALTER TABLE public.bookclub_waitlist ADD COLUMN IF NOT EXISTS memo TEXT;
ALTER TABLE public.bookclub_waitlist ADD COLUMN IF NOT EXISTS consented_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookclub_waitlist_contact_method_chk'
  ) THEN
    ALTER TABLE public.bookclub_waitlist
      ADD CONSTRAINT bookclub_waitlist_contact_method_chk
      CHECK (contact_method IS NULL OR contact_method IN ('sms', 'kakao', 'call'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookclub_waitlist_memo_len_chk'
  ) THEN
    ALTER TABLE public.bookclub_waitlist
      ADD CONSTRAINT bookclub_waitlist_memo_len_chk
      CHECK (memo IS NULL OR char_length(memo) <= 500);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.join_bookclub_interest(
  p_club_slug TEXT,
  p_name      TEXT,
  p_phone     TEXT,
  p_method    TEXT,
  p_memo      TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_phone TEXT;
  v_method TEXT;
  v_memo TEXT;
BEGIN
  v_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_method := coalesce(nullif(btrim(coalesce(p_method, '')), ''), 'sms');
  v_memo := nullif(btrim(coalesce(p_memo, '')), '');

  IF p_club_slug IS NULL OR btrim(p_club_slug) = ''
     OR p_name IS NULL OR btrim(p_name) = '' OR char_length(btrim(p_name)) > 80
     OR v_phone = '' OR char_length(v_phone) < 9 OR char_length(v_phone) > 15
     OR v_method NOT IN ('sms', 'kakao', 'call')
     OR (v_memo IS NOT NULL AND char_length(v_memo) > 500) THEN
    RAISE EXCEPTION USING MESSAGE = 'invalid_input', ERRCODE = 'P0001';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.bookclub_waitlist
    WHERE COALESCE(club_slug, '') = p_club_slug AND phone = v_phone
  ) THEN
    -- 다시 신청하면 연락 방법·남기실 말만 최신으로 갱신
    UPDATE public.bookclub_waitlist
      SET contact_method = v_method,
          memo = COALESCE(v_memo, memo),
          consented_at = now()
      WHERE COALESCE(club_slug, '') = p_club_slug AND phone = v_phone;
    RETURN jsonb_build_object('kind', 'duplicate');
  END IF;

  INSERT INTO public.bookclub_waitlist (club_slug, name, phone, contact_method, memo, consented_at)
  VALUES (p_club_slug, btrim(p_name), v_phone, v_method, v_memo, now());

  RETURN jsonb_build_object('kind', 'joined');
END;
$function$;

REVOKE ALL ON FUNCTION public.join_bookclub_interest(TEXT, TEXT, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.join_bookclub_interest(TEXT, TEXT, TEXT, TEXT, TEXT)
  TO service_role;

COMMIT;

-- ======================================================================
-- 024_reading_journey_interests.sql
-- ======================================================================
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

notify pgrst, 'reload schema';
