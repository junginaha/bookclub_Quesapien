-- ============================================================
-- 025 — M0 profiles 컬럼 (운영 DB 적용본, 재실행 안전)
--
-- 009_profiles_v2.sql은 `extensions.geography(point,4326)`와 `public.events`에
-- 의존하는데, 이 운영 DB는 postgis가 **public** 스키마에 설치돼 있고 events
-- 테이블이 없다. 그래서 009는 끝내 적용되지 못했고, profiles에는 001의 원본
-- 8개 컬럼(id,email,name,avatar_url,bio,joined_at,session_count,question_count)만
-- 남아 있었다 — 구글/카카오 로그인 후 /onboarding/profile 저장이
-- "Could not find the 'home_region' column" 으로 실패한 원인.
--
-- 이 파일은 009의 profiles 부분만, 현 운영 DB 기준으로 다시 쓴 것이다.
-- DROP 없음. 여러 번 실행해도 안전하다.
-- ============================================================

alter table public.profiles
  add column if not exists nickname text,
  add column if not exists phone text,                                -- 하이픈 없는 국내번호
  add column if not exists home_region public.geography(Point, 4326), -- postgis는 public 스키마
  add column if not exists is_operator boolean not null default false,
  add column if not exists privacy_consented_at timestamptz,
  add column if not exists phone_consented_at timestamptz,
  add column if not exists deactivated_at timestamptz,
  -- profiles 행은 handle_new_user 트리거가 즉시 만들기 때문에 "행 존재 여부"로는
  -- 신규 유저를 구분할 수 없다. 온보딩 완료 여부는 이 컬럼으로 판단한다.
  add column if not exists onboarding_completed_at timestamptz;

-- 이미 쓰고 있던 회원에게 온보딩을 다시 요구하지 않는다.
update public.profiles
   set onboarding_completed_at = coalesce(onboarding_completed_at, joined_at)
 where onboarding_completed_at is null;

-- 닉네임 백필 — 기존 name을 그대로 쓴다.
update public.profiles set nickname = name where nickname is null;

-- is_operator는 본인이 바꿀 수 없어야 한다(프론트 숨김만으로 보호 금지).
revoke update (is_operator) on public.profiles from authenticated;

-- ⚠ 개인정보: profiles의 RLS 정책은 "Public read profiles" = `using (true)` 라서
-- 비로그인(anon)도 전 회원의 모든 행을 읽는다. 여기에 phone(전화번호)과
-- home_region(거주지 좌표)을 그냥 추가하면 로그인 없이 REST API로 전 회원
-- 연락처를 긁어갈 수 있다. anon의 테이블 단위 SELECT를 회수하고, 공개해도
-- 되는 컬럼만 다시 부여한다(= 이후 추가되는 컬럼도 기본 비공개).
-- email도 이 참에 anon에서 빠진다 — 공개 경로는 모두 id/name/avatar_url/bio만 읽는다.
--
-- authenticated는 건드리지 않는다: getProfile() 등 select("*") 호출부가 깨지지
-- 않게 하기 위함. "로그인한 회원이 타인의 phone을 볼 수 있다"는 더 넓은 문제는
-- profiles_public 뷰 분리가 필요한 구조 변경이라 CLAUDE.md에 TBD로 남긴다.
revoke select on public.profiles from anon;
grant select (id, name, avatar_url, bio, joined_at, session_count, question_count, nickname)
  on public.profiles to anon;

-- PostgREST 스키마 캐시 갱신(안 하면 새 컬럼을 한동안 못 찾는다).
notify pgrst, 'reload schema';
