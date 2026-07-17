-- ============================================================
-- Migration 015: discussion_feedback — 발제 생성기 복사 게이트용 피드백
-- ============================================================
-- ⚠ 이 저장소의 실행 환경은 라이브 Supabase 프로젝트에 대한 네트워크 접근이 없어
-- 이 마이그레이션은 적용되지 않았다. 운영자가 Supabase 대시보드 SQL 에디터에
-- 그대로 붙여넣어 실행해야 한다. (008~014와 동일 제약)
--
-- 2026-07-17 운영자 지시: 발제 생성기의 "복사" 기능은 사용자가 서비스에 대한
-- 간단한 피드백(3버튼 원탭 반응 + 선택적 한 줄 코멘트)을 남긴 뒤에만 사용할 수
-- 있다. discussion_id는 giant_discussions(발제 생성기가 자동 저장하는 발제
-- 데이터, migration 014)를 참조한다.

CREATE TABLE IF NOT EXISTS discussion_feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID REFERENCES giant_discussions(id) ON DELETE CASCADE,
  session_key   TEXT NOT NULL,
  reaction      TEXT NOT NULL CHECK (reaction IN ('up', 'neutral', 'down')),
  comment       TEXT,
  input_text    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (discussion_id, session_key)
);

ALTER TABLE discussion_feedback ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'discussion_feedback' AND policyname = 'Anyone can insert discussion feedback'
  ) THEN
    CREATE POLICY "Anyone can insert discussion feedback"
      ON discussion_feedback FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'discussion_feedback' AND policyname = 'Anyone can delete own-session discussion feedback'
  ) THEN
    CREATE POLICY "Anyone can delete own-session discussion feedback"
      ON discussion_feedback FOR DELETE TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'discussion_feedback' AND policyname = 'Service role can select discussion feedback'
  ) THEN
    CREATE POLICY "Service role can select discussion feedback"
      ON discussion_feedback FOR SELECT TO service_role USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_discussion_feedback_created_at ON discussion_feedback (created_at DESC);
