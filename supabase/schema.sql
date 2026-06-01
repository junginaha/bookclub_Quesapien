-- ============================================================
-- 질문하는 사람들 — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ── 1. Landing Book Clubs ────────────────────────────────────
CREATE TABLE IF NOT EXISTS landing_book_clubs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,           -- e.g. "다정함의-발명"
  title         TEXT NOT NULL,
  author        TEXT,
  color         TEXT NOT NULL DEFAULT 'navy',   -- css color variant
  genre         TEXT,
  tag           TEXT,
  recommender   TEXT,
  reason        TEXT,
  emotion_tags  TEXT[] DEFAULT '{}',
  is_mini       BOOLEAN NOT NULL DEFAULT false,

  -- Editable by admin / host
  schedule      TEXT,                           -- "매월 첫째 토요일 오후 2시"
  location      TEXT,
  location_url  TEXT,                           -- kakao map link
  join_url      TEXT,
  description   TEXT,
  host_name     TEXT,
  host_intro    TEXT,
  host_id       UUID REFERENCES auth.users(id),
  max_participants   INTEGER,
  current_participants INTEGER DEFAULT 0,
  session_dates JSONB DEFAULT '[]',             -- [{date, topic, closed}]
  season_number INTEGER,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed','upcoming')),

  sort_order    INTEGER DEFAULT 0,
  created_by    UUID REFERENCES auth.users(id),
  updated_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER landing_book_clubs_updated
  BEFORE UPDATE ON landing_book_clubs
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- RLS
ALTER TABLE landing_book_clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read landing_book_clubs"
  ON landing_book_clubs FOR SELECT USING (true);

CREATE POLICY "Admin or host can update landing_book_clubs"
  ON landing_book_clubs FOR UPDATE
  USING (
    auth.uid() = host_id
    OR auth.uid() = created_by
    OR auth.email() = ANY(
      string_to_array(current_setting('app.admin_emails', true), ',')
    )
  );

CREATE POLICY "Admin can insert landing_book_clubs"
  ON landing_book_clubs FOR INSERT
  WITH CHECK (
    auth.email() = ANY(
      string_to_array(current_setting('app.admin_emails', true), ',')
    )
    OR auth.uid() IS NOT NULL
  );


-- ── 2. Landing Questions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS landing_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content         TEXT NOT NULL,
  author_name     TEXT DEFAULT '익명',
  author_id       UUID REFERENCES auth.users(id),
  likes           INTEGER NOT NULL DEFAULT 0,
  saves           INTEGER NOT NULL DEFAULT 0,
  answers_count   INTEGER NOT NULL DEFAULT 0,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_today        BOOLEAN NOT NULL DEFAULT false,
  is_approved     BOOLEAN NOT NULL DEFAULT true,  -- default approve (moderate after)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE landing_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved questions"
  ON landing_questions FOR SELECT USING (is_approved = true);

CREATE POLICY "Anyone can insert question"
  ON landing_questions FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update question"
  ON landing_questions FOR UPDATE
  USING (
    auth.uid() = author_id
    OR auth.email() = ANY(
      string_to_array(current_setting('app.admin_emails', true), ',')
    )
  );


-- ── 3. Question Reactions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS landing_question_reactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES landing_questions(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id),
  session_key TEXT,                             -- for anonymous users
  type        TEXT NOT NULL CHECK (type IN ('like','save')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(question_id, user_id, type),
  UNIQUE(question_id, session_key, type)
);

ALTER TABLE landing_question_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read reactions" ON landing_question_reactions FOR SELECT USING (true);
CREATE POLICY "Anyone can react"     ON landing_question_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "User can delete own reaction"
  ON landing_question_reactions FOR DELETE
  USING (auth.uid() = user_id OR session_key IS NOT NULL);


-- ── 4. Question Answers / Margin Notes ───────────────────────
CREATE TABLE IF NOT EXISTS landing_question_answers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES landing_questions(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  author_name TEXT DEFAULT '익명',
  author_id   UUID REFERENCES auth.users(id),
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE landing_question_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read answers" ON landing_question_answers FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can answer"   ON landing_question_answers FOR INSERT WITH CHECK (true);


-- ── 5. Quiz Results ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id),
  session_key     TEXT,                         -- browser fingerprint for anonymous
  mbti_type       TEXT NOT NULL,                -- POET | SAGE | SEEKER | BRIDGE
  answers         JSONB NOT NULL DEFAULT '{}',  -- {q1: 'A', q2: 'B', ...}
  recommended_slugs TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can read own quiz results"
  ON quiz_results FOR SELECT
  USING (auth.uid() = user_id OR session_key IS NOT NULL);

CREATE POLICY "Anyone can insert quiz result"
  ON quiz_results FOR INSERT WITH CHECK (true);


-- ── 6. Seed: main 6 books ────────────────────────────────────
INSERT INTO landing_book_clubs (slug, title, author, color, genre, tag, recommender, reason, emotion_tags, is_mini, sort_order) VALUES
  ('최신간-북토크',        '최신간 북토크, 핫한 문장들',   'Quesapience', 'navy',  'NEW',           '#신간 #트렌드',      'Q5',   '새벽 세 시에 깨어 있는 사람만 아는 문장이 여기 있습니다.',    ARRAY['#불면','#회복','#고요'],   false, 10),
  ('다정함의-발명',        '다정함의 발명',               '허지영',       'cream', 'ESSAY · 산문',   '#관계 · #사랑',      '지영', '사랑은 큰 사건이 아니라 매일 발명되는 작은 다정함이라는 말.',  ARRAY['#다정함','#일상','#연결'], false, 20),
  ('혼자라는-감각',        '혼자라는 감각',               '주성원',       'rust',  'PHILOSOPHY',    '#외로움 · #인생전환', '성원', '고독을 결핍이 아니라 깊이로 다루는 책.',                    ARRAY['#고독','#성장','#사유'],   false, 30),
  ('아무도-보지-않는-오후', '아무도 보지 않는 오후',        '김범',         'olive', 'MEMOIR · 회고',  '#창업 · #번아웃',    '범',   '실패한 사람이 아니라, 멈춰본 적 있는 사람의 문장.',           ARRAY['#회복','#쉼','#용기'],     false, 40),
  ('오늘-저녁-당신께',     '오늘 저녁, 당신께',            '박상현',       'dusk',  'POETRY · 시',   '#사랑 · #이별',      '상현', '시집은 빠르게 읽지 않는 것이라고 가르쳐준 책.',              ARRAY['#느림','#이별','#기억'],   false, 50),
  ('인간이라는-풍경',      '인간이라는 풍경',             '한강',         'sage',  'NON-FICTION',   '#인간 · #사유',      '한강', '인간을 풍경처럼 멀리서 바라보는 시선.',                      ARRAY['#관계','#용서','#거리'],   false, 60)
ON CONFLICT (slug) DO NOTHING;

-- Seed: 24 mini clubs
INSERT INTO landing_book_clubs (slug, title, recommender, color, is_mini, current_participants, sort_order) VALUES
  ('제자리로-돌아오는-밤에',   '제자리로 돌아오는 밤에',          '서연', 'terra', true, 8,  10),
  ('느리게-읽는-일',           '느리게 읽는 일',                  '진호', 'smoke', true, 11, 20),
  ('어머니의-문장들',          '어머니의 문장들',                 '지우', 'mauve', true, 9,  30),
  ('흐린-날의-사유',           '흐린 날의 사유',                  '민재', 'fog',   true, 14, 40),
  ('아무것도-하지-않는-연습',  '아무것도 하지 않는 연습',         '은지', 'ochre', true, 16, 50),
  ('일을-사랑하면서',          '일을 사랑하면서 일에 지지 않는 법', '태우', 'navy',  true, 22, 60),
  ('이름-없는-감정들에게',     '이름 없는 감정들에게',            '은재', 'cream', true, 10, 70),
  ('수요일-저녁-낭독회',       '수요일 저녁 낭독회',              '현우', 'olive', true, 7,  80),
  ('아버지라는-낯선-사람',     '아버지라는 낯선 사람',            '도현', 'rust',  true, 13, 90),
  ('쓰이지-않는-시간이-있다',  '쓰이지 않는 시간이 있다',         '하은', 'sage',  true, 9,  100),
  ('어둠-속의-밝은-한-줄',     '어둠 속의 밝은 한 줄',            '제이', 'dusk',  true, 6,  110),
  ('온전하지-않은-시절',       '온전하지 않은 시절',              '안녕', 'terra', true, 12, 120),
  ('헤어진-이들의-재회',       '헤어진 이들의 재회',              '다연', 'mauve', true, 8,  130),
  ('도시의-올랜-해',           '도시의 올랜 해',                  '우재', 'smoke', true, 11, 140),
  ('죽음을-읽는-일곱-가지',    '죽음을 읽는 일곱 가지 시선',      '혁',   'ink',   true, 15, 150),
  ('난-당신을-잘-모릅니다',    '난 당신을 잘 모릅니다',           '재희', 'cream', true, 10, 160),
  ('돈이-말해주지-않는',       '돈이 말해주지 않는 것들',         '지훈', 'olive', true, 17, 170),
  ('높은-곳의-창가에서',       '높은 곳의 창가에서',              '세아', 'fog',   true, 9,  180),
  ('다시-걸을-수-있는-사람들', '다시 걸을 수 있는 사람들',        '혜원', 'rust',  true, 13, 190),
  ('외국어로-읽는-한국-소설',  '외국어로 읽는 한국 소설',         '명희', 'ochre', true, 6,  200),
  ('넘어진-자리에서',          '넘어진 자리에서 주워 든 것들',    '연우', 'mauve', true, 11, 210),
  ('밤에만-편지를-씁니다',     '밤에만 편지를 씁니다',            '레이', 'dusk',  true, 8,  220),
  ('자연을-읽는-일요일',       '자연을 읽는 일요일',              '소희', 'sage',  true, 14, 230),
  ('철학이-필요한-저녁',       '철학이 필요한 저녁',              '윤',   'navy',  true, 18, 240)
ON CONFLICT (slug) DO NOTHING;

-- ── 7. Seed: sample today question ──────────────────────────
INSERT INTO landing_questions (content, author_name, is_featured, is_today) VALUES
  ('당신은 마지막으로 언제, 진심으로 울었나요?', '서연', true, true),
  ('인간은 왜 외로운가요?', '현우', true, false),
  ('AI 시대에도 사랑은 여전히 중요할까요?', '민지', true, false),
  ('당신을 살게 만든 한 문장은 무엇인가요?', '도연', true, false)
ON CONFLICT DO NOTHING;

-- ── 8. Archive Reviews ───────────────────────────────────────
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

ALTER TABLE archive_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved archive_reviews" ON archive_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can insert archive_reviews" ON archive_reviews FOR INSERT WITH CHECK (true);

-- Seed: sample archive reviews (approved)
INSERT INTO archive_reviews (type, content, author_name, is_approved) VALUES
  ('text', '처음으로 모르는 사람 앞에서 솔직한 대화를 했어요. 그 밤이 한 달 동안 저를 흔들고 있었습니다.', '채현 · UX 디자이너 · 30', true),
  ('text', '사람은 아직 믿을 만하다는 감각을 4년 만에 다시 느꼈습니다. 그게 가장 큰 회복이었어요.', '진우 · 개발자 · 34', true),
  ('text', '질문 하나가 삶을 흔들었습니다. 그 후로 일을 그만두고 6개월을 쉬었어요. 후회하지 않습니다.', '윤서 · 에디터 · 28', true),
  ('text', '대답을 잘 하려 애쓰지 않게 된 첫 번째 자리였어요. 정답 없이 머무는 법을 배웠습니다.', '도연 · 대학원생 · 26', true),
  ('text', '우리 반 아이들에게도 이런 자리를 만들어주고 싶다고 생각했습니다. 그게 변화의 시작이었어요.', '하린 · 교사 · 39', true)
ON CONFLICT DO NOTHING;
