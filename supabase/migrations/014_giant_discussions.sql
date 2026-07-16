-- ============================================================
-- Migration 014: giant_discussions — 거인의 어깨 발제 아카이브 (M4)
-- ============================================================
-- ⚠ 이 저장소의 실행 환경은 라이브 Supabase 프로젝트에 대한 네트워크 접근이 없어
-- 이 마이그레이션은 적용되지 않았다. 운영자가 Supabase 대시보드 SQL 에디터에
-- 그대로 붙여넣어 실행해야 한다.
--
-- MASTER.md M4 스펙: "발제 생성: 도서+거인 선택 → Anthropic API 발제 질문
-- 3~5개 → ... 기존 인물 페이지는 발제 아카이브로 재구성." 이 테이블은 생성된
-- 발제(발제문·토론질문·아이스브레이킹·추천도서)를 인물+책+주제와 함께 영구
-- 저장하고 검색 가능하게 한다.
--
-- ⚠ 법적 게이트(CLAUDE.md 절대 원칙 7 / MASTER.md D1.5): 거인의 어깨 콘텐츠는
-- 사망 70년 규칙 정식 법적 검증 전까지 신규 노출 금지. src/data/giants.ts는
-- 이번 세션에 사망연도 기준 1차 기계 스크리닝으로 87명만 남기도록 필터링됐다
-- (생존 인물 및 사후 70년 미경과 13명 제외, 원본 100명은 src/data/giants.backup-100.ts에
-- 별도 보관, 서비스 코드에서 import하지 않음). 이건 정식 법적 검증이 아니라
-- 1차 스크리닝이므로, 운영자의 최종 법률 확인 전까지는 참고용으로만 취급할 것.

CREATE TABLE IF NOT EXISTS giant_discussions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giant_slug            TEXT NOT NULL,
  giant_name            TEXT NOT NULL,
  book_title            TEXT,
  topic                 TEXT,
  statement             TEXT NOT NULL,
  discussion_questions  TEXT[] NOT NULL DEFAULT '{}',
  icebreaker_questions  TEXT[] NOT NULL DEFAULT '{}',
  recommended_books     JSONB NOT NULL DEFAULT '[]',
  source_messages       JSONB,
  author_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name           TEXT NOT NULL DEFAULT '익명',
  is_public             BOOLEAN NOT NULL DEFAULT true,
  likes                 INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE giant_discussions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'giant_discussions' AND policyname = 'Public read public giant_discussions'
  ) THEN
    CREATE POLICY "Public read public giant_discussions"
      ON giant_discussions FOR SELECT USING (is_public = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'giant_discussions' AND policyname = 'Owner read own giant_discussions'
  ) THEN
    CREATE POLICY "Owner read own giant_discussions"
      ON giant_discussions FOR SELECT USING (author_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'giant_discussions' AND policyname = 'Anyone can insert giant_discussions'
  ) THEN
    CREATE POLICY "Anyone can insert giant_discussions"
      ON giant_discussions FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'giant_discussions' AND policyname = 'Owner can update own giant_discussions'
  ) THEN
    CREATE POLICY "Owner can update own giant_discussions"
      ON giant_discussions FOR UPDATE
      USING (author_id = auth.uid())
      WITH CHECK (author_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'giant_discussions' AND policyname = 'Owner can delete own giant_discussions'
  ) THEN
    CREATE POLICY "Owner can delete own giant_discussions"
      ON giant_discussions FOR DELETE USING (author_id = auth.uid());
  END IF;
END $$;

-- 검색: 인물명·책 제목·주제·발제문 대상 간단 전문검색(한국어 형태소 분석기 없이 simple config 사용)
CREATE INDEX IF NOT EXISTS idx_giant_discussions_search
  ON giant_discussions
  USING GIN (
    to_tsvector('simple',
      coalesce(giant_name, '') || ' ' ||
      coalesce(book_title, '') || ' ' ||
      coalesce(topic, '') || ' ' ||
      coalesce(statement, '')
    )
  );

CREATE INDEX IF NOT EXISTS idx_giant_discussions_giant_slug ON giant_discussions (giant_slug);
CREATE INDEX IF NOT EXISTS idx_giant_discussions_created_at ON giant_discussions (created_at DESC);
