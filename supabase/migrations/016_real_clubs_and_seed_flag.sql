-- ============================================================
-- Migration 016: is_seed 플래그 + 2026년 8~10월 실제 북클럽 등록
--                + 지난 실제 진행 2건 + 오늘의 질문 연결
-- ============================================================
-- ⚠ 이 저장소의 실행 환경은 라이브 Supabase 프로젝트에 대한 아웃바운드 네트워크
-- 접근이 없다 (CLAUDE.md에 기록된 기존 제약과 동일, 이번 세션에서도 재확인함).
-- 운영자가 Supabase 대시보드 SQL 에디터에 이 파일을 그대로 붙여넣어 실행해야 한다.
-- 전부 IF NOT EXISTS / ON CONFLICT 패턴이라 여러 번 실행해도 안전하다.
--
-- 배경: 코드(src/lib/bookclub.ts)는 이미 why_this_book·recommended_for·
-- session_format·host_philosophy 등을 참조하고 있었지만, 이 컬럼들이 실제
-- landing_book_clubs 테이블에는 지금까지 한 번도 추가된 적이 없었다(감사 중 확인).
-- 이번 마이그레이션에서 함께 추가한다.

-- ── 1. is_seed 플래그 ────────────────────────────────────────
-- 목업/시드 데이터를 삭제하지 않고 노출만 차단하기 위한 컬럼(작업1).
ALTER TABLE landing_book_clubs
  ADD COLUMN IF NOT EXISTS is_seed BOOLEAN NOT NULL DEFAULT false;

-- ── 2. 상세 소개 컬럼 (기존 프론트엔드가 이미 참조하던 필드, 뒤늦게 추가) ──
ALTER TABLE landing_book_clubs
  ADD COLUMN IF NOT EXISTS why_this_book        TEXT,
  ADD COLUMN IF NOT EXISTS key_questions         TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS recommended_for       TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS session_format        TEXT,
  ADD COLUMN IF NOT EXISTS host_philosophy       TEXT,
  ADD COLUMN IF NOT EXISTS host_books_read       INTEGER,
  ADD COLUMN IF NOT EXISTS host_sessions_count   INTEGER,
  ADD COLUMN IF NOT EXISTS host_rating           NUMERIC;

-- ── 3. 2026년 8~10월 실제 모임 3건 (작업2~4, is_seed = false) ──────
INSERT INTO landing_book_clubs (
  slug, title, author, color, genre, tag, is_seed, author_hosts,
  host_name, event_starts_at, location, area, price,
  max_participants, current_participants,
  reason, description, recommended_for, session_format,
  status, sort_order
) VALUES
(
  '어떻게-민주주의는-무너지는가',
  '어떻게 민주주의는 무너지는가',
  '스티븐 레비츠키 · 대니얼 지블랫',
  'navy', 'POLITICAL SCIENCE', '#정치 #사회', false, false,
  '루하', '2026-08-15T10:00:00+09:00', '에피소드 강남 262', NULL, 20000,
  8, 0,
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
  ARRAY[
    '요즘 뉴스가 자꾸 마음에 걸리는 분',
    '주말 아침을 근사하게 열고 싶은 분',
    '책 이야기 나눌 사람이 그리웠던 분'
  ],
  '준비물은 책, 그리고 질문 하나. 나머지는 저희가 전부 준비해 둘게요.',
  'active', 1
),
(
  '위험한-리더는-어떻게-만들어지는가',
  '위험한 리더는 어떻게 만들어지는가',
  '스티브 테일러',
  'rust', 'PSYCHOLOGY', '#리더십 #심리', false, false,
  '서결', '2026-09-19T10:00:00+09:00', '에피소드 강남 262', NULL, 20000,
  8, 0,
  '자리가 사람을 만들고,
추종이 리더를 만듭니다.',
  '권력은 사람을 시험합니다.
그리고 그 시험은
멀리 있지 않아요.
회의실에서, 단톡방에서,
우리가 고개를 끄덕이는
순간마다 조용히 일어납니다.

이 책을 사이에 두고
서로에게 물어봅니다.
좋은 자리는 사람을
어떻게 바꾸는지.
나는 어떤 리더 곁에
서고 싶은지.

당신의 일터에도 있는
이야기예요.
함께 꺼내 봐요.',
  '{}', NULL,
  'active', 2
),
(
  '나는-메트로폴리탄-미술관의-경비원입니다',
  '나는 메트로폴리탄 미술관의 경비원입니다',
  '패트릭 브링리',
  'olive', 'MEMOIR', '#상실 #회복', false, false,
  '온새', '2026-10-17T10:00:00+09:00', '에피소드 강남 262', NULL, 20000,
  8, 0,
  '그림 앞에 서 있던
10년의 기록.
조용히, 오래 남는 책이에요.',
  '형을 잃은 남자가
세계에서 가장 큰 미술관의
경비원이 되었습니다.
10년 동안 그림 앞에
서 있었어요.
그리고 천천히, 회복했습니다.

깊어지는 가을,
상실과 회복에 대해
이야기 나눠요.
슬픔을 지나온 분도,
지나는 중인 분도,
그 곁에 있고 싶은 분도
환영합니다.

조용한 책이에요.
그래서 오래 남습니다.',
  '{}', NULL,
  'active', 3
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, author = EXCLUDED.author, color = EXCLUDED.color,
  genre = EXCLUDED.genre, tag = EXCLUDED.tag, is_seed = EXCLUDED.is_seed,
  host_name = EXCLUDED.host_name, event_starts_at = EXCLUDED.event_starts_at,
  location = EXCLUDED.location, price = EXCLUDED.price,
  max_participants = EXCLUDED.max_participants,
  reason = EXCLUDED.reason, description = EXCLUDED.description,
  recommended_for = EXCLUDED.recommended_for, session_format = EXCLUDED.session_format,
  status = EXCLUDED.status, sort_order = EXCLUDED.sort_order;

-- ── 4. 지난 실제 진행 2건 (작업7, "다시 함께 읽어요", is_seed = false) ──
-- event_starts_at이 과거이므로 classifyClub()이 자동으로 "again"으로 분류한다.
INSERT INTO landing_book_clubs (
  slug, title, author, color, is_seed,
  event_starts_at, location,
  reason, description,
  status, sort_order
) VALUES
(
  '오직-나를-위한-미술관', '오직 나를 위한 미술관', '정여울', 'dusk', false,
  '2026-06-20T10:00:00+09:00', '에피소드 강남 262',
  '그림 앞에서 멈췄던 날.
나를 위한 시간이었어요.',
  '그림 앞에서 멈췄던 날.
나를 위한 시간이었어요.',
  'closed', 10
),
(
  '게으름에-대한-찬양', '게으름에 대한 찬양', '버트런드 러셀', 'sage', false,
  '2026-07-18T10:00:00+09:00', '에피소드 강남 262',
  '90여 년 전 철학자가 물었어요.
왜 그렇게 바쁘게 사느냐고.
우리는 그날,
함께 대답을 찾았습니다.
투표에서 가장 많은 표를
받은 책이었어요.',
  '90여 년 전 철학자가 물었어요.
왜 그렇게 바쁘게 사느냐고.
우리는 그날,
함께 대답을 찾았습니다.
투표에서 가장 많은 표를
받은 책이었어요.',
  'closed', 11
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, author = EXCLUDED.author, color = EXCLUDED.color,
  is_seed = EXCLUDED.is_seed, event_starts_at = EXCLUDED.event_starts_at,
  location = EXCLUDED.location, reason = EXCLUDED.reason,
  description = EXCLUDED.description, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order;

-- ── 5. 오늘의 질문 → 8월 모임 연결 (작업8) ────────────────────────
ALTER TABLE landing_questions
  ADD COLUMN IF NOT EXISTS linked_slug  TEXT,
  ADD COLUMN IF NOT EXISTS linked_label TEXT;

-- 기존에 is_today=true였던 질문은 내리고, 새 질문을 오늘의 질문으로 올린다.
UPDATE landing_questions SET is_today = false WHERE is_today = true;

INSERT INTO landing_questions (content, author_name, is_approved, is_today, linked_slug, linked_label)
SELECT
  '당신이 요즘
지키고 있는 것은 무엇인가요?',
  '편집팀', true, true,
  '어떻게-민주주의는-무너지는가',
  '이 질문, 8월 15일 토요일 아침에 함께 이야기해요 →'
WHERE NOT EXISTS (
  SELECT 1 FROM landing_questions
  WHERE content = '당신이 요즘
지키고 있는 것은 무엇인가요?'
);

-- ── 6. (참고) 시드 후기 5건은 DB가 아니라 프론트엔드 코드에 하드코딩되어
-- 있었다(src/components/home/LandingPage.tsx의 testimonials 배열 — 채현·진우·
-- 윤서·도연·하린). DB 마이그레이션 대상이 아니라 이미 코드에서 is_seed로
-- 필터링해 노출을 차단했다. 여기서는 별도 조치가 필요 없다.
