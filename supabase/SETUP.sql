-- ============================================================
-- 질문하는 사람들 — 전체 스키마 설정
-- https://app.supabase.com/project/smoehxmgnnaulrxjkqvm/sql/new
-- 이 파일 전체를 복사해서 SQL Editor에 붙여넣고 실행하세요.
-- ============================================================

-- ── 1. Landing Book Clubs ────────────────────────────────────
CREATE TABLE IF NOT EXISTS landing_book_clubs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  author        TEXT,
  color         TEXT NOT NULL DEFAULT 'navy',
  genre         TEXT,
  tag           TEXT,
  recommender   TEXT,
  reason        TEXT,
  emotion_tags  TEXT[] DEFAULT '{}',
  is_mini       BOOLEAN NOT NULL DEFAULT false,
  schedule      TEXT,
  location      TEXT,
  location_url  TEXT,
  join_url      TEXT,
  description   TEXT,
  host_name     TEXT,
  host_intro    TEXT,
  host_id       UUID REFERENCES auth.users(id),
  max_participants   INTEGER,
  current_participants INTEGER DEFAULT 0,
  session_dates JSONB DEFAULT '[]',
  season_number INTEGER,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed','upcoming')),
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  sort_order    INTEGER DEFAULT 0,
  created_by    UUID REFERENCES auth.users(id),
  updated_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS landing_book_clubs_updated ON landing_book_clubs;
CREATE TRIGGER landing_book_clubs_updated
  BEFORE UPDATE ON landing_book_clubs
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

ALTER TABLE landing_book_clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Public read landing_book_clubs" ON landing_book_clubs FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Admin or host can update" ON landing_book_clubs FOR UPDATE USING (auth.uid() = host_id OR auth.uid() = created_by);
CREATE POLICY IF NOT EXISTS "Auth user can insert" ON landing_book_clubs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── 2. Landing Questions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS landing_questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content       TEXT NOT NULL,
  author_name   TEXT DEFAULT '익명',
  author_id     UUID REFERENCES auth.users(id),
  likes         INTEGER NOT NULL DEFAULT 0,
  saves         INTEGER NOT NULL DEFAULT 0,
  answers_count INTEGER NOT NULL DEFAULT 0,
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  is_today      BOOLEAN NOT NULL DEFAULT false,
  is_approved   BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE landing_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Public read approved questions" ON landing_questions FOR SELECT USING (is_approved = true);
CREATE POLICY IF NOT EXISTS "Anyone can insert question" ON landing_questions FOR INSERT WITH CHECK (true);

-- ── 3. Landing Question Answers ──────────────────────────────
CREATE TABLE IF NOT EXISTS landing_question_answers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES landing_questions(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  author_name TEXT DEFAULT '익명',
  author_id   UUID REFERENCES auth.users(id),
  likes       INTEGER NOT NULL DEFAULT 0,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE landing_question_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Public read answers" ON landing_question_answers FOR SELECT USING (is_approved = true);
CREATE POLICY IF NOT EXISTS "Anyone can answer" ON landing_question_answers FOR INSERT WITH CHECK (true);

-- 답변 수 자동 증가
CREATE OR REPLACE FUNCTION increment_answers_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE landing_questions SET answers_count = COALESCE(answers_count, 0) + 1 WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_answer_insert ON landing_question_answers;
CREATE TRIGGER on_answer_insert AFTER INSERT ON landing_question_answers FOR EACH ROW EXECUTE FUNCTION increment_answers_count();

-- ── 4. Landing Question Reactions ───────────────────────────
CREATE TABLE IF NOT EXISTS landing_question_reactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES landing_questions(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id),
  session_key TEXT,
  type        TEXT NOT NULL CHECK (type IN ('like','save')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(question_id, user_id, type),
  UNIQUE(question_id, session_key, type)
);

ALTER TABLE landing_question_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Public read reactions" ON landing_question_reactions FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can react" ON landing_question_reactions FOR INSERT WITH CHECK (true);

-- ── 5. Archive Reviews ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS archive_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text','photo','video')),
  content     TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT '익명',
  author_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  photo_url   TEXT,
  video_url   TEXT,
  likes       INTEGER NOT NULL DEFAULT 0,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE archive_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Public read approved reviews" ON archive_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY IF NOT EXISTS "Anyone can insert review" ON archive_reviews FOR INSERT WITH CHECK (true);

-- ── 6. Archive Review Likes ──────────────────────────────────
CREATE TABLE IF NOT EXISTS archive_review_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   UUID REFERENCES archive_reviews(id) ON DELETE CASCADE,
  session_key TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (review_id, session_key)
);
ALTER TABLE archive_review_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Anyone can like" ON archive_review_likes FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Public read likes" ON archive_review_likes FOR SELECT USING (true);

-- ── 7. Storage Bucket ────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('reviews', 'reviews', true, 10485760, ARRAY['image/jpeg','image/png','image/gif','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ── 8. 시드 데이터 ──────────────────────────────────────────
INSERT INTO landing_book_clubs (slug,title,author,color,genre,tag,recommender,reason,emotion_tags,is_mini,sort_order,lat,lng) VALUES
  ('최신간-북토크','최신간 북토크, 핫한 문장들','Quesapience','navy','NEW','#신간 #트렌드','Q5','새벽 세 시에 깨어 있는 사람만 아는 문장이 여기 있습니다.',ARRAY['#불면','#회복','#고요'],false,10,37.4930,127.0151),
  ('다정함의-발명','다정함의 발명','허지영','cream','ESSAY · 산문','#관계 · #사랑','지영','사랑은 큰 사건이 아니라 매일 발명되는 작은 다정함이라는 말.',ARRAY['#다정함','#일상','#연결'],false,20,37.4946,127.0209),
  ('혼자라는-감각','혼자라는 감각','주성원','rust','PHILOSOPHY','#외로움 · #인생전환','성원','고독을 결핍이 아니라 깊이로 다루는 책.',ARRAY['#고독','#성장','#사유'],false,30,37.5492,126.9148),
  ('아무도-보지-않는-오후','아무도 보지 않는 오후','김범','olive','MEMOIR · 회고','#창업 · #번아웃','범','실패한 사람이 아니라, 멈춰본 적 있는 사람의 문장.',ARRAY['#회복','#쉼','#용기'],false,40,37.5344,127.0049),
  ('오늘-저녁-당신께','오늘 저녁, 당신께','박상현','dusk','POETRY · 시','#사랑 · #이별','상현','시집은 빠르게 읽지 않는 것이라고 가르쳐준 책.',ARRAY['#느림','#이별','#기억'],false,50,37.5921,126.9602),
  ('인간이라는-풍경','인간이라는 풍경','한강','sage','NON-FICTION','#인간 · #사유','한강','인간을 풍경처럼 멀리서 바라보는 시선.',ARRAY['#관계','#용서','#거리'],false,60,37.5558,126.9073)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO landing_questions (content, author_name, is_featured, is_today) VALUES
  ('당신은 마지막으로 언제, 진심으로 울었나요?', '서연', true, true),
  ('인간은 왜 외로운가요?', '현우', true, false),
  ('AI 시대에도 사랑은 여전히 중요할까요?', '민지', true, false),
  ('당신을 살게 만든 한 문장은 무엇인가요?', '도연', true, false)
ON CONFLICT DO NOTHING;

INSERT INTO archive_reviews (type, content, author_name, is_approved) VALUES
  ('text','처음으로 모르는 사람 앞에서 솔직한 대화를 했어요. 그 밤이 한 달 동안 저를 흔들고 있었습니다.','채현 · UX 디자이너 · 30',true),
  ('text','사람은 아직 믿을 만하다는 감각을 4년 만에 다시 느꼈습니다. 그게 가장 큰 회복이었어요.','진우 · 개발자 · 34',true),
  ('text','질문 하나가 삶을 흔들었습니다. 그 후로 일을 그만두고 6개월을 쉬었어요. 후회하지 않습니다.','윤서 · 에디터 · 28',true),
  ('text','대답을 잘 하려 애쓰지 않게 된 첫 번째 자리였어요. 정답 없이 머무는 법을 배웠습니다.','도연 · 대학원생 · 26',true),
  ('text','우리 반 아이들에게도 이런 자리를 만들어주고 싶다고 생각했습니다. 그게 변화의 시작이었어요.','하린 · 교사 · 39',true)
ON CONFLICT DO NOTHING;
