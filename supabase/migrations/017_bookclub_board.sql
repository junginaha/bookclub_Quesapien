-- ============================================================
-- Migration 017: 북클럽 참가 게시판 (docs/bookclub-spec.md)
-- ============================================================
-- ⚠ 이 저장소의 실행 환경은 라이브 Supabase 프로젝트에 대한 아웃바운드 네트워크
-- 접근이 없다(CLAUDE.md에 이미 기록된 기존 제약과 동일) — 운영자가 Supabase
-- 대시보드 SQL 에디터에 그대로 붙여넣어 실행해야 한다. 전부 IF NOT EXISTS 패턴이라
-- 여러 번 실행해도 안전하다.
--
-- 설계 메모(운영자 확인용):
-- - starts_at/ends_at/closes_at/place/book_title/book_author/capacity는 이미
--   011·016에서 추가된 event_starts_at/event_ends_at/registration_closes_at/
--   location/title/author/max_participants 컬럼을 그대로 쓴다 — 중복 컬럼을
--   새로 만들지 않는다.
-- - ask(카드 얼굴 질문)는 이미 있는 reason 컬럼을 그대로 쓴다(실데이터 3건 모두
--   이미 "…까요?" 형태의 질문 문장이 들어있어 그대로 맞는다).
-- - prose(본문 3문단)는 description, questions는 key_questions, who는
--   recommended_for를 그대로 쓴다.
-- - status 컬럼은 이미 존재하고 다른 코드(구 /bookclub, /api/book-clubs)가
--   참조 중이라 DROP하지 않는다. 이번 게시판의 상태 판정은 이 컬럼을 아예
--   읽지 않고 starts_at/closes_at/capacity/applied로만 계산한다.
-- - club_hosts(복수 리더) 테이블은 만들지 않는다 — 카드에는 리더 1명만 노출되고
--   기존 host_name 컬럼이 이미 그 역할을 하고 있어 새 조인 테이블이 불필요하다.

-- ── 1. 게시판 전용 신규 컬럼 ────────────────────────────────────
ALTER TABLE landing_book_clubs
  ADD COLUMN IF NOT EXISTS price_note   TEXT,
  ADD COLUMN IF NOT EXISTS bring        TEXT,
  ADD COLUMN IF NOT EXISTS name_example TEXT;

COMMENT ON COLUMN landing_book_clubs.bring IS
  '준비물 — 비어 있으면 화면에 고정 문구("준비물은 책, 그리고 질문 하나.")를 대신 노출한다.';
COMMENT ON COLUMN landing_book_clubs.name_example IS
  '신청 폼 이름 입력란 placeholder에 쓸 예시 이름(예: 서결).';

-- ── 2. 신청/대기 테이블 ────────────────────────────────────────
-- 정원(capacity)은 landing_book_clubs.max_participants에 이미 있다. 여기서는
-- "누가 신청했는지"만 저장하고, applied/waiting/left는 저장하지 않고 매번 계산한다.
CREATE TABLE IF NOT EXISTS landing_book_club_signups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     UUID NOT NULL REFERENCES landing_book_clubs(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  contact     TEXT NOT NULL,
  subscribe   BOOLEAN NOT NULL DEFAULT true,
  kind        TEXT NOT NULL CHECK (kind IN ('signup', 'wait')),
  position    INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS signups_club_kind_idx
  ON landing_book_club_signups (club_id, kind);

ALTER TABLE landing_book_club_signups ENABLE ROW LEVEL SECURITY;

-- 원문 이름·연락처가 들어있는 테이블이라 공개 정책을 만들지 않는다. 신청 생성은
-- 아래 apply_to_book_club_signup() 함수(SECURITY DEFINER)를 통해서만, 조회/집계는
-- 서버(API 라우트, service role)에서만 처리한다 — 클라이언트에는 절대 직접 노출하지 않는다.

-- ── 3. 지난 모임 한 줄 기록 ────────────────────────────────────
-- 개인정보가 없는 공개 콘텐츠라 SELECT는 공개로 둔다. 클럽당 기록 1건.
CREATE TABLE IF NOT EXISTS landing_book_club_past_notes (
  club_id     UUID PRIMARY KEY REFERENCES landing_book_clubs(id) ON DELETE CASCADE,
  note        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE landing_book_club_past_notes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'landing_book_club_past_notes' AND policyname = 'Past notes are public'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Past notes are public"
        ON landing_book_club_past_notes FOR SELECT
        USING (true);
    $policy$;
  END IF;
END $$;

-- ── 4. 신청 집계 뷰 (서버 전용 — service role로만 조회) ──────────
-- 정원(capacity)은 절대 포함하지 않는다. applied/waiting 개수만 낸다.
CREATE OR REPLACE VIEW landing_book_club_signup_counts AS
  SELECT
    club_id,
    count(*) FILTER (WHERE kind = 'signup') AS applied_count,
    count(*) FILTER (WHERE kind = 'wait')   AS waiting_count
  FROM landing_book_club_signups
  GROUP BY club_id;

-- ── 5. 트랜잭션 신청 함수 ───────────────────────────────────────
-- 클럽 행에 FOR UPDATE 잠금을 걸어 같은 클럽에 대한 동시 신청을 직렬화한다.
-- 정원(v_capacity)은 함수 내부 계산에만 쓰고 리턴값에는 절대 포함하지 않는다
-- (kind/position만 반환 — 클라이언트가 정원 숫자를 알 수 없게 함).
CREATE OR REPLACE FUNCTION apply_to_book_club_signup(
  p_club_id   UUID,
  p_name      TEXT,
  p_contact   TEXT,
  p_subscribe BOOLEAN DEFAULT true
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_capacity INTEGER;
  v_applied  INTEGER;
  v_waiting  INTEGER;
  v_id       UUID;
  v_position INTEGER;
BEGIN
  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RAISE EXCEPTION 'name_required';
  END IF;
  IF p_contact IS NULL OR btrim(p_contact) = '' THEN
    RAISE EXCEPTION 'contact_required';
  END IF;

  SELECT max_participants INTO v_capacity
    FROM landing_book_clubs
    WHERE id = p_club_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'club_not_found';
  END IF;

  SELECT count(*) INTO v_applied
    FROM landing_book_club_signups
    WHERE club_id = p_club_id AND kind = 'signup';

  IF v_capacity IS NOT NULL AND v_applied < v_capacity THEN
    INSERT INTO landing_book_club_signups (club_id, name, contact, subscribe, kind)
    VALUES (p_club_id, btrim(p_name), btrim(p_contact), coalesce(p_subscribe, true), 'signup')
    RETURNING id INTO v_id;

    RETURN jsonb_build_object('kind', 'signup', 'id', v_id);
  ELSE
    SELECT count(*) INTO v_waiting
      FROM landing_book_club_signups
      WHERE club_id = p_club_id AND kind = 'wait';

    v_position := v_waiting + 1;

    INSERT INTO landing_book_club_signups (club_id, name, contact, subscribe, kind, position)
    VALUES (p_club_id, btrim(p_name), btrim(p_contact), coalesce(p_subscribe, true), 'wait', v_position)
    RETURNING id INTO v_id;

    RETURN jsonb_build_object('kind', 'wait', 'id', v_id, 'position', v_position);
  END IF;
END;
$$;

-- anon/authenticated에는 실행 권한을 주지 않는다 — 우리 자체 API 라우트가
-- service role로만 이 함수를 호출한다(공개 앵콜 RPC와 동일한 패턴).
REVOKE ALL ON FUNCTION apply_to_book_club_signup(UUID, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
