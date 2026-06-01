-- ============================================================
-- Migration 003: Archive Reviews + Landing Question Answers
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ── Archive Reviews ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS archive_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'photo', 'video')),
  content       TEXT NOT NULL,
  author_name   TEXT NOT NULL DEFAULT '익명',
  author_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  photo_url     TEXT,
  video_url     TEXT,
  likes         INTEGER NOT NULL DEFAULT 0,
  is_approved   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE archive_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved archive_reviews"
  ON archive_reviews FOR SELECT USING (is_approved = true);

CREATE POLICY "Anyone can insert archive_reviews"
  ON archive_reviews FOR INSERT WITH CHECK (true);

-- ── Archive Review Likes ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS archive_review_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   UUID REFERENCES archive_reviews(id) ON DELETE CASCADE,
  session_key TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (review_id, session_key)
);

ALTER TABLE archive_review_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can like" ON archive_review_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read likes" ON archive_review_likes FOR SELECT USING (true);

-- ── Landing Question Answers ──────────────────────────────────
CREATE TABLE IF NOT EXISTS landing_question_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id     UUID REFERENCES landing_questions(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  author_name     TEXT NOT NULL DEFAULT '익명',
  author_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  likes           INTEGER NOT NULL DEFAULT 0,
  is_approved     BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE landing_question_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved answers"
  ON landing_question_answers FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can submit answer"
  ON landing_question_answers FOR INSERT WITH CHECK (true);

-- Increment answers_count on landing_questions when an answer is inserted
CREATE OR REPLACE FUNCTION increment_answers_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE landing_questions
  SET answers_count = COALESCE(answers_count, 0) + 1
  WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_answer_insert ON landing_question_answers;
CREATE TRIGGER on_answer_insert
  AFTER INSERT ON landing_question_answers
  FOR EACH ROW EXECUTE FUNCTION increment_answers_count();

-- ── Storage Bucket for review photos ─────────────────────────
-- Run this separately in Supabase dashboard or via CLI:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reviews', 'reviews', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage RLS (after bucket is created)
-- CREATE POLICY "Public read review photos"
--   ON storage.objects FOR SELECT USING (bucket_id = 'reviews');
-- CREATE POLICY "Anyone can upload review photo"
--   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reviews' AND octet_length(name) < 10485760);
