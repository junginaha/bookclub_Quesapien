-- ============================================================
-- Migration 020: 실제 북클럽 일정 + 운영 가능한 참가 예약
-- ============================================================
-- 이 파일은 기본 landing_book_clubs 테이블만 있는 운영 DB에서도 단독 실행할 수
-- 있다. 모든 스키마 변경과 시드는 재실행 가능하며, 전체 작업은 한 트랜잭션으로
-- 묶어 일부만 반영되는 상태를 만들지 않는다.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── 1. 실제 일정과 상세 화면에 필요한 landing_book_clubs 컬럼 ──────
ALTER TABLE public.landing_book_clubs
  ADD COLUMN IF NOT EXISTS event_starts_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS event_ends_at            TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS registration_closes_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS area                     TEXT,
  ADD COLUMN IF NOT EXISTS price                    NUMERIC,
  ADD COLUMN IF NOT EXISTS author_hosts             BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS encore_eligible          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS encore_threshold         INTEGER NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS archived_at              TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_seed                  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS why_this_book            TEXT,
  ADD COLUMN IF NOT EXISTS key_questions            TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS recommended_for          TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS session_format           TEXT,
  ADD COLUMN IF NOT EXISTS host_philosophy          TEXT,
  ADD COLUMN IF NOT EXISTS host_books_read          INTEGER,
  ADD COLUMN IF NOT EXISTS host_sessions_count      INTEGER,
  ADD COLUMN IF NOT EXISTS host_rating              NUMERIC,
  ADD COLUMN IF NOT EXISTS price_note               TEXT,
  ADD COLUMN IF NOT EXISTS bring                    TEXT,
  ADD COLUMN IF NOT EXISTS name_example             TEXT,
  ADD COLUMN IF NOT EXISTS updated_at               TIMESTAMPTZ NOT NULL DEFAULT now();

COMMENT ON COLUMN public.landing_book_clubs.event_starts_at IS
  '실제 모임 시작 시각. UTC로 저장하고 화면에서는 Asia/Seoul로 표시한다.';
COMMENT ON COLUMN public.landing_book_clubs.registration_closes_at IS
  '예약 접수 마감 시각. 비어 있으면 예약 RPC가 모임 시작 시각을 마감으로 사용한다.';
COMMENT ON COLUMN public.landing_book_clubs.is_seed IS
  '목업/시드 데이터 여부. true인 행에는 실제 예약을 받지 않는다.';

-- ── 2. 2026-08-15 실제 북클럽 ────────────────────────────────
-- current_participants는 기존 운영값을 덮어쓰지 않는다. 실제 예약 수는 아래
-- landing_book_club_signups의 active 행에서 원자적으로 계산한다.
INSERT INTO public.landing_book_clubs (
  slug,
  title,
  author,
  color,
  genre,
  tag,
  is_mini,
  is_seed,
  author_hosts,
  host_name,
  event_starts_at,
  event_ends_at,
  registration_closes_at,
  location,
  area,
  price,
  price_note,
  max_participants,
  current_participants,
  reason,
  description,
  why_this_book,
  key_questions,
  recommended_for,
  session_format,
  bring,
  name_example,
  status,
  sort_order
) VALUES (
  '어떻게-민주주의는-무너지는가',
  '어떻게 민주주의는 무너지는가',
  '스티븐 레비츠키 · 대니얼 지블랫',
  'navy',
  'POLITICAL SCIENCE',
  '#정치 #사회',
  false,
  false,
  false,
  '루하',
  '2026-08-15T10:00:00+09:00',
  '2026-08-15T12:00:00+09:00',
  '2026-08-15T10:00:00+09:00',
  '에피소드 강남 262',
  '강남·서초',
  20000,
  '커피와 대화, 전부 포함',
  8,
  0,
  '광복절 아침, 여덟 명이
둘러앉아 묻습니다.
"우리는 무엇을 지키고 있을까."',
  '토요일 아침 열 시,
에피소드 강남 262.
커피 향이 도는 테이블에
여덟 명이 둘러앉아요.

하필 광복절 아침에
이 책을 폅니다.
민주주의는 광장에서 태어나
식탁에서, 일터에서,
우리의 말 속에서
매일 이어지니까요.
81년 전 누군가 되찾은 것을,
지금 우리는 어떻게
지키고 있는지 —
그 질문에 잠시 머물러 봅니다.

두 시간의 대화가 끝나고
돌아가는 길,
같은 뉴스가 조금 다르게
보일 거예요.',
  '민주주의가 무너지는 거대한 순간보다 우리가 대수롭지 않게 넘기는 작은 신호를 함께 읽기 위해 선택한 책입니다.',
  ARRAY[
    '반대편을 상대가 아니라 적으로 보기 시작하면 어떤 일이 생길까요?',
    '법을 지키면서도 민주주의를 약하게 만들 수 있을까요?',
    '우리는 어떤 위험 신호를 놓치고 있을까요?'
  ],
  ARRAY[
    '요즘 뉴스가 자꾸 마음에 걸리는 분',
    '주말 아침을 근사하게 열고 싶은 분',
    '책 이야기 나눌 사람이 그리웠던 분'
  ],
  '최대 8명이 원으로 둘러앉아 질문을 중심으로 대화합니다.',
  '책, 그리고 질문 하나',
  '지민',
  'active',
  1
)
ON CONFLICT (slug) DO UPDATE SET
  title                    = EXCLUDED.title,
  author                   = EXCLUDED.author,
  color                    = EXCLUDED.color,
  genre                    = EXCLUDED.genre,
  tag                      = EXCLUDED.tag,
  is_mini                  = EXCLUDED.is_mini,
  is_seed                  = EXCLUDED.is_seed,
  author_hosts             = EXCLUDED.author_hosts,
  host_name                = EXCLUDED.host_name,
  event_starts_at          = EXCLUDED.event_starts_at,
  event_ends_at            = EXCLUDED.event_ends_at,
  registration_closes_at   = EXCLUDED.registration_closes_at,
  location                 = EXCLUDED.location,
  area                     = EXCLUDED.area,
  price                    = EXCLUDED.price,
  price_note               = EXCLUDED.price_note,
  max_participants         = EXCLUDED.max_participants,
  reason                   = EXCLUDED.reason,
  description              = EXCLUDED.description,
  why_this_book            = EXCLUDED.why_this_book,
  key_questions            = EXCLUDED.key_questions,
  recommended_for          = EXCLUDED.recommended_for,
  session_format           = EXCLUDED.session_format,
  bring                    = EXCLUDED.bring,
  name_example             = EXCLUDED.name_example,
  status                   = EXCLUDED.status,
  sort_order               = EXCLUDED.sort_order,
  archived_at              = NULL,
  updated_at               = now();

-- 달력에 공개된 9·10월 실제 일정도 같은 예약 경로로 접수한다. 화면에 보이는
-- 일정이 정적 폴백에만 남아 404가 되지 않도록 016의 운영 데이터를 함께 보강한다.
INSERT INTO public.landing_book_clubs (
  slug, title, author, color, genre, tag, is_mini, is_seed, author_hosts,
  host_name, event_starts_at, event_ends_at, registration_closes_at,
  location, price, price_note, max_participants, current_participants,
  reason, description, key_questions, recommended_for, bring, name_example,
  status, sort_order
) VALUES
(
  '위험한-리더는-어떻게-만들어지는가',
  '위험한 리더는 어떻게 만들어지는가',
  '스티브 테일러',
  'rust', 'PSYCHOLOGY', '#리더십 #심리', false, false, false,
  '질문하는 사람들',
  '2026-09-19T10:00:00+09:00', '2026-09-19T12:00:00+09:00', '2026-09-19T10:00:00+09:00',
  '에피소드 강남 262', 20000, '커피와 대화, 전부 포함', 8, 0,
  '자리가 사람을 만들고, 추종이 리더를 만듭니다.',
  '권력은 사람을 시험합니다.
그리고 그 시험은 멀리 있지 않아요.
회의실에서, 단톡방에서,
우리가 고개를 끄덕이는 순간마다 조용히 일어납니다.

이 책을 사이에 두고 서로에게 물어봅니다.
좋은 자리는 사람을 어떻게 바꾸는지,
나는 어떤 리더 곁에 서고 싶은지.

당신의 일터에도 있는 이야기예요.
함께 꺼내 봐요.',
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], '책, 그리고 질문 하나', '지민',
  'active', 2
),
(
  '나는-메트로폴리탄-미술관의-경비원입니다',
  '나는 메트로폴리탄 미술관의 경비원입니다',
  '패트릭 브링리',
  'olive', 'MEMOIR', '#상실 #회복', false, false, false,
  '질문하는 사람들',
  '2026-10-17T10:00:00+09:00', '2026-10-17T12:00:00+09:00', '2026-10-17T10:00:00+09:00',
  '에피소드 강남 262', 20000, '커피와 대화, 전부 포함', 8, 0,
  '그림 앞에 서 있던 10년의 기록. 조용히, 오래 남는 책이에요.',
  '형을 잃은 남자가 세계에서 가장 큰 미술관의 경비원이 되었습니다.
10년 동안 그림 앞에 서 있었고, 천천히 회복했습니다.

깊어지는 가을, 상실과 회복에 대해 이야기 나눠요.
슬픔을 지나온 분도, 지나는 중인 분도,
그 곁에 있고 싶은 분도 환영합니다.

조용한 책이에요. 그래서 오래 남습니다.',
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], '책, 그리고 질문 하나', '지민',
  'active', 3
)
ON CONFLICT (slug) DO UPDATE SET
  title                  = EXCLUDED.title,
  author                 = EXCLUDED.author,
  color                  = EXCLUDED.color,
  genre                  = EXCLUDED.genre,
  tag                    = EXCLUDED.tag,
  is_mini                = EXCLUDED.is_mini,
  is_seed                = EXCLUDED.is_seed,
  author_hosts           = EXCLUDED.author_hosts,
  host_name              = EXCLUDED.host_name,
  event_starts_at        = EXCLUDED.event_starts_at,
  event_ends_at          = EXCLUDED.event_ends_at,
  registration_closes_at = EXCLUDED.registration_closes_at,
  location               = EXCLUDED.location,
  price                  = EXCLUDED.price,
  price_note             = EXCLUDED.price_note,
  max_participants       = EXCLUDED.max_participants,
  reason                 = EXCLUDED.reason,
  description            = EXCLUDED.description,
  key_questions          = EXCLUDED.key_questions,
  recommended_for        = EXCLUDED.recommended_for,
  bring                  = EXCLUDED.bring,
  name_example           = EXCLUDED.name_example,
  status                 = EXCLUDED.status,
  sort_order             = EXCLUDED.sort_order,
  archived_at            = NULL,
  updated_at             = now();

-- ── 3. 예약 테이블 ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.landing_book_club_signups (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id                  UUID NOT NULL REFERENCES public.landing_book_clubs(id) ON DELETE CASCADE,
  name                     TEXT NOT NULL,
  contact                  TEXT NOT NULL,
  normalized_contact       TEXT NOT NULL,
  subscribe                BOOLEAN NOT NULL DEFAULT false,
  privacy_consented_at     TIMESTAMPTZ,
  kind                     TEXT NOT NULL,
  position                 INTEGER,
  status                   TEXT NOT NULL DEFAULT 'active',
  cancel_token_hash        TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  canceled_at              TIMESTAMPTZ
);

-- 017이 먼저 적용된 다른 환경에서도 같은 파일을 안전하게 재사용할 수 있도록
-- 예약 강화 컬럼을 개별 보강한다.
ALTER TABLE public.landing_book_club_signups
  ADD COLUMN IF NOT EXISTS normalized_contact       TEXT,
  ADD COLUMN IF NOT EXISTS privacy_consented_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status                   TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS cancel_token_hash        TEXT,
  ADD COLUMN IF NOT EXISTS updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS canceled_at              TIMESTAMPTZ;

ALTER TABLE public.landing_book_club_signups
  ALTER COLUMN subscribe SET DEFAULT false;

-- 구 017 행이 존재하는 환경의 연락처도 중복 판정에 사용할 수 있게 보강한다.
-- 이메일은 email:소문자, 전화번호는 phone:숫자 형식으로 맞춘다. 둘 다 아닌
-- 값은 legacy:trim+소문자로 보존하여 빈 normalized_contact가 생기지 않게 한다.
UPDATE public.landing_book_club_signups
SET normalized_contact = CASE
  WHEN position('@' IN btrim(contact)) > 0
    THEN 'email:' || lower(btrim(contact))
  WHEN regexp_replace(contact, '[^0-9]', '', 'g') <> ''
    THEN 'phone:' || regexp_replace(contact, '[^0-9]', '', 'g')
  ELSE 'legacy:' || lower(btrim(contact))
END
WHERE normalized_contact IS NULL OR btrim(normalized_contact) = '';

ALTER TABLE public.landing_book_club_signups
  ALTER COLUMN normalized_contact SET NOT NULL;

DO $constraints$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.landing_book_club_signups'::regclass
      AND conname = 'bookclub_signups_kind_check_v2'
  ) THEN
    ALTER TABLE public.landing_book_club_signups
      ADD CONSTRAINT bookclub_signups_kind_check_v2
      CHECK (kind IN ('signup', 'wait'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.landing_book_club_signups'::regclass
      AND conname = 'bookclub_signups_status_check'
  ) THEN
    ALTER TABLE public.landing_book_club_signups
      ADD CONSTRAINT bookclub_signups_status_check
      CHECK (status IN ('active', 'canceled'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.landing_book_club_signups'::regclass
      AND conname = 'bookclub_signups_position_check'
  ) THEN
    ALTER TABLE public.landing_book_club_signups
      ADD CONSTRAINT bookclub_signups_position_check
      CHECK (
        (kind = 'signup' AND position IS NULL)
        OR (kind = 'wait' AND position IS NOT NULL AND position > 0)
      );
  END IF;

  -- 과거 017 행에는 동의 시각이 없을 수 있어 NOT VALID로 추가한다. 이 제약은
  -- 이후 생성·수정되는 active 예약에는 즉시 적용되며 새 RPC도 동의를 강제한다.
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.landing_book_club_signups'::regclass
      AND conname = 'bookclub_signups_active_privacy_check'
  ) THEN
    ALTER TABLE public.landing_book_club_signups
      ADD CONSTRAINT bookclub_signups_active_privacy_check
      CHECK (status <> 'active' OR privacy_consented_at IS NOT NULL)
      NOT VALID;
  END IF;
END
$constraints$;

-- 새 설치(또는 동의 누락 active 행이 없는 환경)에서는 개인정보 제약을 즉시
-- VALID 상태로 만든다. 구 017의 동의 기록 없는 행이 있으면 강제 추정하지 않는다.
DO $privacy_validation$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.landing_book_club_signups
    WHERE status = 'active' AND privacy_consented_at IS NULL
  ) THEN
    ALTER TABLE public.landing_book_club_signups
      VALIDATE CONSTRAINT bookclub_signups_active_privacy_check;
  END IF;
END
$privacy_validation$;

CREATE INDEX IF NOT EXISTS bookclub_signups_club_kind_status_idx
  ON public.landing_book_club_signups (club_id, kind, status);

CREATE UNIQUE INDEX IF NOT EXISTS bookclub_signups_active_contact_uidx
  ON public.landing_book_club_signups (club_id, normalized_contact)
  WHERE status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS bookclub_signups_cancel_token_uidx
  ON public.landing_book_club_signups (cancel_token_hash)
  WHERE cancel_token_hash IS NOT NULL;

ALTER TABLE public.landing_book_club_signups ENABLE ROW LEVEL SECURITY;

-- 이름·연락처 원문이 있으므로 공개 RLS 정책은 만들지 않는다. PostgREST 기본
-- 권한도 명시적으로 회수하고 서버의 service_role만 접근시킨다.
REVOKE ALL ON TABLE public.landing_book_club_signups FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.landing_book_club_signups TO service_role;

-- ── 4. 활성 예약 집계 뷰 ──────────────────────────────────────
CREATE OR REPLACE VIEW public.landing_book_club_signup_counts AS
SELECT
  club_id,
  count(*) FILTER (WHERE status = 'active' AND kind = 'signup') AS applied_count,
  count(*) FILTER (WHERE status = 'active' AND kind = 'wait')   AS waiting_count
FROM public.landing_book_club_signups
GROUP BY club_id;

REVOKE ALL ON TABLE public.landing_book_club_signup_counts FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.landing_book_club_signup_counts TO service_role;

-- ── 5. 원자적 예약 RPC ───────────────────────────────────────
-- 같은 클럽 행을 FOR UPDATE로 잠근 뒤 중복·정원·대기 순번을 판정하므로 동시에
-- 여러 요청이 들어와도 정원을 초과하지 않는다. 중복 요청은 새 행을 만들지 않고
-- 취소 토큰만 회전하여 다른 기기에서도 새 토큰으로 취소할 수 있게 한다.
CREATE OR REPLACE FUNCTION public.reserve_book_club_spot(
  p_club_id             UUID,
  p_name                TEXT,
  p_contact             TEXT,
  p_contact_normalized  TEXT,
  p_subscribe           BOOLEAN,
  p_privacy_accepted    BOOLEAN
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, extensions, public
AS $function$
DECLARE
  v_capacity             INTEGER;
  v_starts_at            TIMESTAMPTZ;
  v_closes_at            TIMESTAMPTZ;
  v_club_status          TEXT;
  v_is_seed              BOOLEAN;
  v_archived_at          TIMESTAMPTZ;
  v_normalized_contact   TEXT;
  v_taken                INTEGER;
  v_waiting              INTEGER;
  v_kind                 TEXT;
  v_position             INTEGER;
  v_existing_id          UUID;
  v_existing_kind        TEXT;
  v_existing_position    INTEGER;
  v_cancel_token         TEXT;
  v_cancel_token_hash    TEXT;
BEGIN
  IF p_privacy_accepted IS DISTINCT FROM true THEN
    RAISE EXCEPTION USING MESSAGE = 'privacy_required', ERRCODE = 'P0001';
  END IF;

  v_normalized_contact := lower(btrim(coalesce(p_contact_normalized, '')));

  IF p_name IS NULL OR btrim(p_name) = ''
     OR char_length(btrim(p_name)) > 80
     OR p_contact IS NULL OR btrim(p_contact) = ''
     OR char_length(btrim(p_contact)) > 254
     OR v_normalized_contact = ''
     OR char_length(v_normalized_contact) > 254 THEN
    RAISE EXCEPTION USING MESSAGE = 'club_unavailable', ERRCODE = 'P0001';
  END IF;

  SELECT
    c.max_participants,
    c.event_starts_at,
    coalesce(c.registration_closes_at, c.event_starts_at),
    c.status,
    coalesce(c.is_seed, false),
    c.archived_at
  INTO
    v_capacity,
    v_starts_at,
    v_closes_at,
    v_club_status,
    v_is_seed,
    v_archived_at
  FROM public.landing_book_clubs AS c
  WHERE c.id = p_club_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'club_not_found', ERRCODE = 'P0001';
  END IF;

  v_cancel_token := encode(gen_random_bytes(32), 'hex');
  v_cancel_token_hash := encode(digest(v_cancel_token, 'sha256'), 'hex');

  -- 중복은 가용성/마감 판정보다 먼저 처리한다. 운영자가 접수를 닫은 뒤에도
  -- 기존 신청자는 토큰을 다시 발급받아 자신의 예약을 취소할 수 있어야 한다.
  SELECT s.id, s.kind, s.position
  INTO v_existing_id, v_existing_kind, v_existing_position
  FROM public.landing_book_club_signups AS s
  WHERE s.club_id = p_club_id
    AND s.normalized_contact = v_normalized_contact
    AND s.status = 'active'
  FOR UPDATE;

  IF FOUND THEN
    UPDATE public.landing_book_club_signups
    SET cancel_token_hash = v_cancel_token_hash,
        privacy_consented_at = coalesce(privacy_consented_at, now()),
        updated_at = now()
    WHERE id = v_existing_id;

    RETURN jsonb_build_object(
      'kind', v_existing_kind,
      'position', v_existing_position,
      'duplicate', true,
      'cancelToken', v_cancel_token
    );
  END IF;

  IF v_is_seed
     OR v_club_status IS NULL
     OR v_club_status NOT IN ('active', 'upcoming')
     OR v_starts_at IS NULL
     OR v_archived_at IS NOT NULL THEN
    RAISE EXCEPTION USING MESSAGE = 'club_unavailable', ERRCODE = 'P0001';
  END IF;

  IF now() >= v_starts_at OR (v_closes_at IS NOT NULL AND now() >= v_closes_at) THEN
    RAISE EXCEPTION USING MESSAGE = 'reservation_closed', ERRCODE = 'P0001';
  END IF;

  IF v_capacity IS NULL OR v_capacity <= 0 THEN
    RAISE EXCEPTION USING MESSAGE = 'capacity_missing', ERRCODE = 'P0001';
  END IF;

  SELECT count(*)::INTEGER
  INTO v_taken
  FROM public.landing_book_club_signups AS s
  WHERE s.club_id = p_club_id
    AND s.kind = 'signup'
    AND s.status = 'active';

  IF v_taken < v_capacity THEN
    v_kind := 'signup';
    v_position := NULL;
  ELSE
    v_kind := 'wait';

    SELECT count(*)::INTEGER + 1
    INTO v_waiting
    FROM public.landing_book_club_signups AS s
    WHERE s.club_id = p_club_id
      AND s.kind = 'wait'
      AND s.status = 'active';

    v_position := v_waiting;
  END IF;

  INSERT INTO public.landing_book_club_signups (
    club_id,
    name,
    contact,
    normalized_contact,
    subscribe,
    privacy_consented_at,
    kind,
    position,
    status,
    cancel_token_hash
  ) VALUES (
    p_club_id,
    btrim(p_name),
    btrim(p_contact),
    v_normalized_contact,
    coalesce(p_subscribe, false),
    now(),
    v_kind,
    v_position,
    'active',
    v_cancel_token_hash
  );

  RETURN jsonb_build_object(
    'kind', v_kind,
    'position', v_position,
    'duplicate', false,
    'cancelToken', v_cancel_token
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.reserve_book_club_spot(UUID, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_book_club_spot(UUID, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN)
  TO service_role;

-- ── 6. 취소 + 첫 대기자 자동 승격 RPC ────────────────────────
CREATE OR REPLACE FUNCTION public.cancel_book_club_reservation(
  p_cancel_token TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, extensions, public
AS $function$
DECLARE
  v_token_hash       TEXT;
  v_reservation_id   UUID;
  v_club_id          UUID;
  v_slug             TEXT;
  v_kind             TEXT;
  v_promoted_id      UUID;
  v_promoted         BOOLEAN := false;
BEGIN
  IF p_cancel_token IS NULL OR btrim(p_cancel_token) = '' THEN
    RAISE EXCEPTION USING MESSAGE = 'reservation_not_found', ERRCODE = 'P0001';
  END IF;

  v_token_hash := encode(digest(btrim(p_cancel_token), 'sha256'), 'hex');

  -- 먼저 club_id를 찾되 행 잠금은 하지 않는다. 이후 클럽 행을 먼저 잠그고 예약
  -- 행을 다시 검증해 reserve RPC와 잠금 순서를 동일하게 유지한다.
  SELECT s.id, s.club_id
  INTO v_reservation_id, v_club_id
  FROM public.landing_book_club_signups AS s
  WHERE s.cancel_token_hash = v_token_hash
    AND s.status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'reservation_not_found', ERRCODE = 'P0001';
  END IF;

  SELECT c.slug
  INTO v_slug
  FROM public.landing_book_clubs AS c
  WHERE c.id = v_club_id
  FOR UPDATE;

  SELECT s.kind
  INTO v_kind
  FROM public.landing_book_club_signups AS s
  WHERE s.id = v_reservation_id
    AND s.cancel_token_hash = v_token_hash
    AND s.status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING MESSAGE = 'reservation_not_found', ERRCODE = 'P0001';
  END IF;

  UPDATE public.landing_book_club_signups
  SET status = 'canceled',
      canceled_at = now(),
      updated_at = now(),
      cancel_token_hash = NULL,
      name = '취소된 예약',
      contact = '',
      normalized_contact = 'canceled:' || id::TEXT,
      subscribe = false
  WHERE id = v_reservation_id;

  IF v_kind = 'signup' THEN
    SELECT s.id
    INTO v_promoted_id
    FROM public.landing_book_club_signups AS s
    WHERE s.club_id = v_club_id
      AND s.kind = 'wait'
      AND s.status = 'active'
    ORDER BY s.created_at ASC, s.id ASC
    LIMIT 1
    FOR UPDATE;

    IF FOUND THEN
      UPDATE public.landing_book_club_signups
      SET kind = 'signup',
          position = NULL,
          updated_at = now()
      WHERE id = v_promoted_id;

      v_promoted := true;
    END IF;
  END IF;

  -- 취소 또는 승격 뒤 남은 대기 순번을 빈틈없이 다시 계산한다.
  WITH ranked AS (
    SELECT
      s.id,
      row_number() OVER (ORDER BY s.created_at ASC, s.id ASC)::INTEGER AS new_position
    FROM public.landing_book_club_signups AS s
    WHERE s.club_id = v_club_id
      AND s.kind = 'wait'
      AND s.status = 'active'
  )
  UPDATE public.landing_book_club_signups AS s
  SET position = ranked.new_position,
      updated_at = now()
  FROM ranked
  WHERE s.id = ranked.id
    AND s.position IS DISTINCT FROM ranked.new_position;

  RETURN jsonb_build_object(
    'canceled', true,
    'promoted', v_promoted,
    'slug', v_slug
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.cancel_book_club_reservation(TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_book_club_reservation(TEXT)
  TO service_role;

COMMIT;
