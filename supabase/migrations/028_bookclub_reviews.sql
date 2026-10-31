-- ============================================================
-- Migration 028: 모임 후기
-- ============================================================
-- 기존 archive_reviews는 회차와 묶이지 않은 자유 기록이라, "이 북클럽은 어땠나"를
-- 모임 페이지에 보여줄 수가 없었다(2026-10-20부터 열려 있던 항목).
--
-- 원칙 둘:
--  1. **후기는 지어내지 않는다.** 시드 데이터를 넣지 않는다. 비어 있으면 비어 있는 채로 둔다.
--  2. **검수를 거친다.** is_published 기본값은 false다. 운영자가 확인한 것만 공개된다.
--
-- 작성 자격은 서버가 본다(그 회차에 확정 신청한 번호). 그래서 insert는 service role로만
-- 들어오고, 공개 읽기는 published 된 줄만 허용한다.

CREATE TABLE IF NOT EXISTS public.bookclub_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_slug     TEXT NOT NULL,
  -- 화면에 보일 이름. 본인이 적는다(익명 허용).
  author_name   TEXT NOT NULL DEFAULT '익명',
  -- 작성 자격 확인과 중복 방지에만 쓴다. 화면에는 내보내지 않는다.
  phone         TEXT NOT NULL,
  content       TEXT NOT NULL CHECK (char_length(content) BETWEEN 2 AND 2000),
  is_published  BOOLEAN NOT NULL DEFAULT false,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 한 사람이 한 회차에 하나. 다시 쓰면 덮어쓴다(중복 더미가 쌓이지 않게).
CREATE UNIQUE INDEX IF NOT EXISTS bookclub_reviews_club_phone_idx
  ON public.bookclub_reviews (club_slug, phone);

-- 모임 페이지에서 공개된 것만 빠르게 읽는다.
CREATE INDEX IF NOT EXISTS bookclub_reviews_published_idx
  ON public.bookclub_reviews (club_slug, published_at DESC)
  WHERE is_published = true;

ALTER TABLE public.bookclub_reviews ENABLE ROW LEVEL SECURITY;

-- 공개 읽기는 **검수를 통과한 줄만**. 전화번호는 어차피 select 대상에서 빼고 읽는다.
DROP POLICY IF EXISTS "read published bookclub reviews" ON public.bookclub_reviews;
CREATE POLICY "read published bookclub reviews"
  ON public.bookclub_reviews FOR SELECT USING (is_published = true);

-- insert/update 정책은 두지 않는다 — 자격 확인을 서버에서 하므로 service role로만 쓴다.
-- anon에게는 전화번호 컬럼을 아예 막는다(정책이 통과해도 값이 나가지 않게).
REVOKE SELECT (phone) ON public.bookclub_reviews FROM anon;
