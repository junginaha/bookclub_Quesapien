# QSAPIENS 2.0 — MASTER
**질문하는 사람들 · 북클럽 통합 플랫폼 · Fable 5 터미널 투입용 최종 통합본**

- 작성일: 2026-07-04 · 발주: 데스크킴 · 19호실출판사 (이하 "운영자")
- 이 파일 하나가 제품 스펙 + 비즈니스 근거 + 세션 운영 규칙 전부다. 프로젝트 루트에 `MASTER.md`로 저장한다.
- 기존 CLAUDE.md 규칙(배포 규칙 · 사망 70년 법적 제약 · 데이터 무결성 · 브랜드 카피 보호)은 전부 유효하며 본 문서에 우선한다.

---

# PART A. 킥오프 프롬프트 (터미널에 이 블록만 복사해 붙여넣는다)

```
MASTER.md를 정독하라. 이것이 Qsapiens 2.0의 유일한 마스터 문서다.
너는 이 프로젝트의 시니어 풀스택 엔지니어이자 제품 파트너로서, PART B의 비즈니스
논리를 이해한 상태로 PART C의 스펙을 구현한다. CLAUDE.md의 기존 규칙은 전부 유효하다.

이번 세션 범위: M0(인증·회원) + M1(오프라인 북클럽 연계).
후속 세션은 M2 → M3 → M5 → M4 순서로, 같은 형식으로 범위만 교체한다.

절대 원칙:
1. 참여자 여정(§C1)의 구조적 귀결 5개를 모든 화면에 반영한다.
   참여 단위는 클럽이 아니라 회차다. 홈은 "내 근처 다음 모임" 피드다.
2. 디자인(§C2): 2.0은 리디자인이 아니다. 기존 사이트의 디자인·감성을 감사(audit)해
   토큰으로 추출하고 그대로 계승한다. 유일한 새 요소는 키캡 버튼(.q-keycap)이며
   화면당 1개, /design-refs의 keycap-button.png와 대조하며 만든다.
3. 스키마는 스펙 초안 기준으로 마이그레이션 파일을 작성하고 RLS를 전면 적용한다.
4. 스펙에 없는 구조·디자인 변경은 임의로 하지 않는다. 반드시 운영자에게 묻는다.
5. 각 마일스톤의 "완료 기준"을 스스로 실행·검증한 뒤에만 완료를 선언한다.
   빌드 통과 ≠ 완료. 완료 기준의 사용자 시나리오가 실제로 동작해야 완료다.
6. 세션 종료 시 CLAUDE.md에 진행 상태·결정 사항·미해결 이슈를 갱신한다.
7. 거인의 어깨 관련 콘텐츠는 M4의 법적 검증(사망 70년 규칙)이 끝나기 전까지
   신규 노출을 금지한다.
8. 가짜 데이터 금지. 시드는 운영자가 제공한 실제 클럽 정보만 사용하고,
   지표·후기·리뷰를 지어내지 않는다.
9. 실서비스 게이트(§D1.5)의 코드 항목은 해당 마일스톤 범위에 포함한다.
   M0에는 개인정보 수집 동의 체크박스와 약관·개인정보처리방침 페이지 골격,
   RLS 침투 테스트 스크립트가 포함된다.

시작 전에 구현 계획(파일 구조, 마이그레이션 목록, 화면 목록, 작업 순서)을 먼저
제시하고 운영자 승인을 받은 뒤 착수하라.
```

---

# PART B0. 브랜드 철학 · Production Rule (2026-07-26 확정)

운영자가 확정한 최상위 원칙. B1(플라이휠)·C1(참여자 여정)·C2(디자인 원칙)를 관통하는
브랜드 정의이며, 이후 모든 기능 판단은 이 파트의 "Production Rule" 9문항을 통과해야
한다. 표현이 겹치는 하위 파트(B1/C1/C2)와 충돌 시 이 파트가 우선한다.

## 브랜드 정의

"사용자는 북클럽을 경험하고, 시스템은 질문 플랫폼으로 성장한다." 질문하는 사람들을
대한민국 최고의 북클럽 플랫폼으로 만든다.

- 외형은 북클럽이다. 본질은 질문 플랫폼이다.
- 사용자는 북클럽에 참여한다고 느낀다.
- 내부에서는 질문·책·사람·후기·운영 기록을 연결하는 플랫폼으로 동작한다.

## 최상위 철학

Human First. AI Ready. Trust Always.
Simple Outside. Powerful Inside.
Minimum Thinking. Minimum Click. Maximum Trust.

AI는 기본 인프라다. AI를 전면에 내세우지 않는다.

## 사용자 경험

사용자는 북클럽만 경험한다. 질문DB를 보지 않는다. SEO를 모른다. Schema를 모른다.
AI를 의식하지 않는다.

사용자는 **북클럽 신청 → 참여 → 후기**만 경험한다.

## UX

- 가능하면 1클릭. 최대 3클릭. 결정을 최소화한다.
- 버튼은 크고 명확하게. 한 화면에는 한 가지 핵심 행동만 배치한다.
- 모바일 우선. 오른쪽 잘림 없음. 가로 스크롤 없음.

## 메인 화면

사용자는 다음만 본다: 지금 모집 중인 북클럽 / 앵콜 모집 / 최근 후기 / 참여하기.
운영 데이터는 노출하지 않는다.

## 북클럽

모든 북클럽은 독립 URL을 가진다. 각 페이지에는 책 / 일정 / 장소 / 참가비 / 신청 /
진행자 / 핵심 질문 / 실제 후기 / FAQ 만 보여준다.

## 질문 구조

질문 → 책 → 북클럽 → 후기 → 다음 질문. 내부에서만 연결한다. 사용자는 이 구조의
복잡함을 느끼지 않는다.

## 운영

운영 기록(질문·후기·사진·참가·수정 이력)은 모두 저장하지만, 운영 화면에서만
관리한다. 사용자 화면에는 노출하지 않는다.

## 콘텐츠

실제 운영 데이터만 공개한다. 가짜 후기·가짜 일정·가짜 참가자·가짜 질문·가짜 사진·
허위 통계는 생성 금지 (절대 원칙 8과 동일한 원칙의 재확인).

## 검색 최적화

Google Search Central 원칙을 따른다. Schema.org를 정확히 적용한다. OAI-SearchBot,
Search Console, Bing Webmaster, AI Performance를 활용한다. 그러나 사용자는 이를
보지 않는다.

## Production Rule — 신규 기능 반영 전 필수 체크리스트

새 기능을 Production에 반영하기 전, 반드시 아래 9개 질문에 전부 "예"여야 한다:

1. 사람에게 더 좋은가?
2. 북클럽 브랜드를 강화하는가?
3. 질문 자산이 축적되는가?
4. 신뢰를 높이는가?
5. 10년 뒤에도 유지되는가?
6. AI가 이해하기 쉬운 구조인가?
7. 클릭을 줄였는가?
8. 모바일에서 직관적인가?
9. 사용자에게 복잡함을 숨겼는가?

---

# PART B. 비즈니스 컨텍스트 — 왜, 무엇으로 돈을 버는가

구현 판단이 갈릴 때 이 파트가 기준이다. 모든 팩트는 [검증됨]/[추정] 표기.

## B1. 포지셔닝과 플라이휠
질문하는 사람들은 운영자가 운영하는 복수의 오프라인 북클럽(잼잼 외)을 흡수 통합하는 플랫폼이다. 핵심 순환:

> 오프라인 모임 → 아카이빙(리캡·후기·질문) → 아카이브가 신규 참여자를 오프라인으로 유입 → 질문 빅데이터 축적 → 시즌제 북토크·B2G로 수익화

기능 판단 기준은 단 하나: **이 순환을 강화하는가.**

## B2. 시장 근거 요약
- 성인 독서율 38.5%로 하락했으나(문체부 2025 조사) [검증됨], 유료 북클럽 지불 행동은 견고: 트레바리 시즌 15~25만 원 + 연회비 10만 원, 2024년 매출 약 49.7억 원 [검증됨]; 넷플연가 3개월 약 20만 원 [검증됨]. 사람들은 책이 아니라 **강제성·소속감·큐레이션된 대화**에 지불한다.
- 고소득층(월 500만+) 독서율 56.1% [검증됨] — 유료 타깃은 축소되지 않음.
- 문체부가 북클럽 지원 확대를 정책으로 명시, 서초구는 이미 본 서비스를 선정 [검증됨] — B2G 경로 실재.
- 단, 자사 유료 전환 데이터는 아직 0건 [검증됨] → 7월 선판매(플랫폼 밖 결제 링크)로 검증 예정. **플랫폼은 이 선판매 코호트를 9월 시즌 1에서 받아내는 그릇이어야 한다.** 이것이 전체 일정의 데드라인 논리다.

## B3. 수익 구조 (플랫폼이 지원해야 할 순서대로)
1. **직영 시즌 멤버십**: QReader 시즌권 12~15만 원(3개월 6회) [추정, 선판매로 검증], QLeader 25~30만 원 [추정], 단건 참여 2~3만 원 [추정]
2. **시즌제 북토크**: 분기 1회 유료 이벤트, 티켓 2~5만 원 [추정]
3. **B2G**: 서초 모델 복제 — 지자체용 성과 리포트가 제품의 일부
4. 파트너 클럽 수수료는 v2. 지금은 만들지 않는다.

## B4. 계측 KPI (M0부터 이벤트 심기)
- 퍼널 4대 이벤트: 가입 / 회차 신청 / 아카이브 조회 / 아카이브→신청 전환
- 수익 KPI: 시즌권 전환율(목표 30%), 시즌 재등록률(목표 50%), 북토크 좌석 판매율
- 이 지표들이 투자·지원사업 내러티브의 원료다. 계측 없는 기능 출시는 미완성으로 간주한다.

---

# PART C. 제품 스펙

## C0. 기술 기반 설정 (M0 착수 전 첫 커밋에서 처리)

- **DB 확장**: 첫 마이그레이션에서 `create extension if not exists postgis;` (M1의 geography 타입 필수) 및 `create extension if not exists vector;` 활성화.
- **환경변수 체크리스트** (`.env.local` / Vercel 환경변수, 세션 시작 시 존재 여부 검증):
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (서버 전용 — 클라이언트 노출 절대 금지)
  - `ANTHROPIC_API_KEY` (M2 리캡 초안·M4 발제 생성, 서버 라우트에서만 호출)
  - 카카오 REST API 키·Client Secret은 Supabase Auth 대시보드에 등록 (코드에 하드코딩 금지)
- **타임존**: 저장은 timestamptz(UTC), 표시는 전부 Asia/Seoul. 날짜 유틸을 한 곳에 두고 재사용.
- **운영자 권한**: `profiles.is_operator boolean default false`. 대시보드·주문 승인·클럽 CRUD는 RLS와 서버 검증 양쪽에서 is_operator를 확인한다. 프론트 숨김만으로 보호 금지.
- **에러 모니터링**: Sentry(무료 티어) 연동, 서버·클라이언트 모두. D1의 6번 완료 조건.
- **KPI 이벤트 테이블** (§B4의 계측 저장소):
```sql
create table events (
  id bigint generated always as identity primary key,
  user_id uuid,                    -- 비로그인은 null
  name text not null,              -- signup | attend_apply | archive_view | archive_to_apply | order_paid ...
  props jsonb,
  created_at timestamptz default now()
);
```

## C1. 참여자 여정 (모든 화면 설계의 기준)

오프라인 북클럽에 처음 나가보려는 사람의 시점. 6단계의 감정이 곧 요구사항이다.

**① 발견 — "북클럽 앱을 검색하는 사람은 없다."** 참여자는 검색·SNS에서 리캡/후기 글을 먼저 만난다. 아카이브 글이 곧 랜딩이다. → 아카이브는 비로그인 전체 공개 + SEO 완비, 글 하단에 "이 모임, 다음엔 직접 오세요" CTA + 다음 회차 정보.

**② 망설임 — "낯선 사람들 틈에 끼는 게 제일 무섭다."** 가입을 막는 건 기능이 아니라 불안. → 클럽 페이지는 스펙보다 분위기 우선: 후기 발췌, 진행 방식 명시("발제 질문 중심, 완독 필수 아님"), 멤버 수, 모임 사진, FAQ 블록(완독 필수 여부·첫 참여자 비율·지각 규칙).

**③ 첫 결심 — 참여 결정의 단위는 클럽이 아니라 회차다.** "클럽 가입"은 무겁고 "7월 12일 그 책 모임"은 가볍다. → 홈과 클럽 페이지의 중심 오브젝트는 **다음 모임 카드**(날짜·장소·책·남은 자리). 즉시참여는 회차 신청으로 동작, 첫 참석 완료 시 자동으로 클럽 멤버가 된다.

**④ 모임 전 — "뭘 얘기할지 미리 알면 덜 무섭다."** → 신청자에게 발제 질문 미리보기 제공. 발제(M4)는 운영 도구이기 전에 첫 참여자의 불안 해소 장치다. 전날 리마인더(초기 이메일, v2.1 알림톡).

**⑤ 모임 후 — "내가 남긴 흔적이 보여야 다시 온다."** → 후기 폼은 두 필드(한 줄 감상 + 가장 좋았던 질문), 30초 완료. 내 후기가 아카이브에 닉네임과 함께 실리는 순간이 리텐션 포인트.

**⑥ 지속 — "나의 독서 기록이 쌓인다."** → 마이페이지 = 개인 서재: 참석한 모임·함께 읽은 책·내가 던진 질문의 타임라인. 나가기는 원탭 — 떠나기 쉬워야 들어오기도 쉽다.

**구조적 귀결 5개**: ①홈 = 내 근처 다음 모임 피드 ②참여 단위 = 회차 신청(`meeting_attendances`) ③클럽 페이지 = 분위기 우선(후기 발췌+FAQ 필수 필드) ④발제 미리보기 = 신청자 혜택 ⑤마이페이지 = 개인 서재.

## C2. 디자인 원칙 — 기존 감성 유지 + 시그니처는 "키캡 버튼"

**대원칙: 2.0은 리디자인이 아니다.** 기존 질문하는 사람들 라이브 사이트의 디자인 언어·감성을 그대로 계승한다. 새 화면을 만들 때는 반드시 기존 코드베이스의 스타일(색·타이포·간격·톤)을 먼저 감사(audit)해서 토큰으로 추출하고, 그 토큰 위에서 작업한다. 임의의 새 팔레트·새 컴포넌트 스타일 도입 금지.

**단 하나의 새 요소 = 키캡 버튼.** 레퍼런스: `/design-refs`의 ①코발트블루 3D 플립 노트 ②백라이트 키캡 "북클럽 둘러보기". 이 서비스의 핵심 행위는 질문을 입력하는 것 — 그래서 시그니처가 키보드 키캡이다. 화면당 단 하나의 핵심 CTA만 키캡으로, 나머지 UI는 기존 감성 그대로 조용하게.

**키캡 전용 토큰** (키캡 컴포넌트에만 사용, 전체 UI에 확산 금지)
```
--q-cobalt:      #2338E0;  /* 키캡 본체 */
--q-cobalt-deep: #1424A8;  /* 음영/눌림 */
--q-glow:        #4D6BFF;  /* 백라이트 내광 */
--q-ivory:       #F5EFD8;  /* 음각 텍스트 — 순백 금지, 크림 */
```
※ 기존 사이트의 브랜드 컬러와 코발트 계열이 충돌하면 키캡 색을 기존 브랜드 주색 쪽으로 조정하되, 재질감(입체·음각·내광·프레스)은 유지한다. 우선순위: 기존 감성 > 레퍼런스 색상.

**타이포**: 키캡 음각만 BMJUA(배민 주아) 계열 둥근 굵은 한글체. 그 외 모든 타이포는 기존 사이트를 따른다.

**`.q-keycap` 규격**: 둥근 사각(radius 22~26%) + 미세 원근, radial 그라디언트 본체. 크림색 텍스트 inner-emboss(상단 어두운 섀도 + 하단 하이라이트) + 은은한 내광. 다층 box-shadow로 키 두께 + 바닥 그림자 + 외광. hover 시 글로우 강화, **press 시 translateY(3px) + 두께 섀도 압축**. `prefers-reduced-motion` 존중.

**사용처(엄격)**: 홈 "북클럽 둘러보기" / 모임 카드 "즉시참여" / 아카이브 하단 CTA — 화면당 1개. 보조 버튼은 기존 스타일 그대로. **금지**: 키캡 스타일의 다른 컴포넌트 확산, 기존 페이지의 불필요한 재스타일링, 순백 텍스트. 플립 노트 아이콘은 앱 아이콘·빈 화면·로딩에 사용(아카이브 = 쌓이는 페이지 은유).

## C3. 마일스톤

가치 우선순위(운영자): 북클럽 연계 → 아카이빙 → 질문 빅데이터 → 거인의 어깨 → 인증 단순화.
**빌드 순서(의존성 + 선판매 데드라인): M0 → M1 → M2 → M3 → M5 → M4.**

### M0 — 인증·회원
- 카카오 OAuth(Supabase Auth) 단일 로그인. 이메일/비번 가입 없음. 전화번호는 가입 직후 필수 프로필 필드(연락·데이터 목적, SMS 인증 로그인은 v2.1 게이트).
- 온보딩 3탭: 카카오 → 닉네임/전화번호/관심 지역(선택) → 완료. 60초 내 마이페이지 도달이 완료 기준.
- 탈퇴 시 auth 삭제 + 콘텐츠는 "탈퇴한 회원"으로 익명화 보존.
```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  phone text,                          -- E.164
  avatar_url text,
  home_region geography(point, 4326),
  is_operator boolean default false,
  created_at timestamptz default now()
);
```

### M1 — 오프라인 북클럽 연계 (최우선 가치)
- 클럽 상세(분위기 우선 구조), **내 근처 북클럽**(PostGIS `ST_DWithin`, 기본 5km, 위치 거부 시 지역명 검색 폴백), **회차 단위 즉시참여**(정원 초과 시 대기열, 승인제 옵션), **원탭 나가기**(후기는 보존).
- 운영자 대시보드: 클럽/회차 CRUD, 멤버 관리. 기존 클럽 이관 시드 스크립트(운영자 제공 실데이터만).
```sql
create table clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text unique not null,
  description text,
  location geography(point, 4326), location_name text,
  schedule_note text, capacity int,
  join_policy text default 'open',        -- open | approval
  vibe jsonb,                              -- FAQ·진행방식·후기발췌 (여정 ② 필수 필드)
  owner_id uuid references profiles(id),
  created_at timestamptz default now()
);
create table memberships (
  club_id uuid references clubs(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text default 'member',             -- owner | host | member
  status text default 'active',           -- active | pending | waitlist | left
  joined_at timestamptz default now(),
  primary key (club_id, user_id)
);
create table meetings (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete cascade,
  book_title text, book_isbn text,
  starts_at timestamptz not null, place_name text,
  capacity int,                           -- null이면 clubs.capacity 상속
  status text default 'scheduled'         -- scheduled | done | canceled
);
create table meeting_attendances (
  meeting_id uuid references meetings(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  status text default 'applied',          -- applied | attended | no_show | canceled
  created_at timestamptz default now(),
  primary key (meeting_id, user_id)
);
```
- 정원 검증은 프론트가 아니라 서버(DB 함수 또는 서버 라우트)에서 원자적으로 처리한다 — 동시 신청 시 초과 입장 방지. 초과분은 waitlist로 자동 전환.

완료 기준: 비로그인 방문자가 근처에서 잼잼을 발견 → 가입 → 회차 신청 → 다음 회차 확인까지 3분 내.

### M2 — 아카이빙 (플라이휠의 심장)
- 입력 3계층: 운영자 리캡(회차당 1개, Anthropic API 초안 보조 — 메모 입력 → 초안 생성 → 사람이 확정), 참가자 후기(두 필드 폼), 모임 질문 기록(M3 원재료).
- 공개 아카이브: 클럽별/도서별/시간순, SEO 메타 완비, 글 하단 즉시참여 CTA. 전환 이벤트 계측.
```sql
create table recaps (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade,
  author_id uuid references profiles(id),
  title text, body text not null,          -- markdown
  is_public boolean default true,
  created_at timestamptz default now()
);
create table reviews (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade,
  author_id uuid references profiles(id),
  body text not null, best_question text,
  is_public boolean default true,
  created_at timestamptz default now()
);
```
완료 기준: 실제 회차 1개가 리캡+후기 2건 이상으로 공개되고, 그 페이지의 즉시참여가 동작.

### M3 — 질문 빅데이터
- `questions` + pgvector 임베딩(등록 시 자동, 비동기), 유사 질문 검색("이 책에 다른 클럽은 뭘 물었나"), 운영자용 시즌 클러스터 뷰(북토크 기획 재료). 기본 공개, 작성자 비공개 옵션.
```sql
create extension if not exists vector;
create table questions (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id),
  book_isbn text,
  author_id uuid references profiles(id),
  body text not null, tags text[],
  source text default 'member',            -- member | giant
  embedding vector(1536),
  is_public boolean default true,
  created_at timestamptz default now()
);
create index on questions using hnsw (embedding vector_cosine_ops);
```
완료 기준: 질문 100개+ 임베딩 상태에서 유사 검색이 체감 품질로 동작.

### M5 — 결제·수익화 (선판매 코호트를 받아내는 그릇)
- **v1 원칙: PG 연동보다 시즌 1 개막이 먼저다.** 결제는 외부 링크(토스 등)로 받고, 플랫폼은 상품·주문·이용권을 관리한다. 운영자가 입금 확인 → 주문 승인 → 이용권 자동 발급. 토스페이먼츠 온사이트 연동은 v1.5.
- 상품 3종: 시즌권(클럽 연결) / 단건 참여권 / 북토크 티켓. 회차 신청 시 이용권 검증(시즌권 보유 or 단건 결제 or 무료 클럽).
- **B2G 리포트**: 지자체 제출용 분기 성과 요약(참여자·모임·아카이브·질문 수) 화면 + 인쇄/내보내기. 이것도 제품이다.
- KPI 대시보드(운영자 전용): §B4의 퍼널·수익 지표.
```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  kind text not null,                       -- season_pass | single_entry | event_ticket
  name text not null, price_krw int not null,
  club_id uuid references clubs(id),        -- season_pass일 때
  season_label text,                        -- '2026-S3'
  active boolean default true
);
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  product_id uuid references products(id),
  status text default 'pending',            -- pending | paid | refunded | canceled
  paid_at timestamptz, note text,
  created_at timestamptz default now()
);
create table entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  product_id uuid references products(id),
  valid_from date, valid_until date,
  remaining_uses int                        -- 단건/티켓용, 시즌권은 null
);
```
완료 기준: 선판매 입금자 1명이 승인 → 시즌권 발급 → 회차 신청 통과까지 운영자 대시보드만으로 처리 가능.

### M4 — 거인의 어깨 재편 (발제 중심)
- **선행 필수: 인물 DB 전수 법적 검증** — 사망 70년 미만 인물 식별 → 제외/대체. 완료 전 신규 노출 금지.
- 발제 생성: 도서+거인 선택 → Anthropic API 발제 질문 3~5개 → 운영자 검수 → 회차 첨부 + `questions(source='giant')` 저장. 신청자 미리보기(여정 ④)로 노출. 기존 인물 페이지는 발제 아카이브로 재구성.
- 완료 기준: 검증 통과 인물만 남은 상태에서 실제 회차 발제 1건이 생성·검수·게시.

## C4. 횡단 요구사항
- RLS 전면 적용(공개 콘텐츠 anon 읽기, 쓰기는 인증+소유권). 모바일 우선(운영자 대시보드만 데스크톱 우선). 아카이브/근처 검색은 서버 컴포넌트+페이지네이션. 임베딩은 비동기. §B4 이벤트 계측은 각 마일스톤에 포함 — 계측 없으면 미완성.

---

# PART D. 완료 정의 · 세션 운영 · 운영자 액션

## D1. "서비스 가능 수준" (전체 완료 정의)
1. 외부인이 링크만 받고 가입→근처 클럽 발견→회차 신청까지 도움 없이 완료
2. 운영 중인 모든 북클럽 등록 + 클럽당 회차 1개·리캡 1개 공개
3. 선판매 결제자가 이용권으로 시즌 1 회차에 실제 입장
4. 거인의 어깨 법적 리스크 인물 0명
5. 운영자가 코드 없이 대시보드만으로 운영 가능
6. Vercel 프로덕션 배포 + 도메인 + 에러 모니터링 + KPI 대시보드 가동

## D1.5 실서비스 게이트 — "돌아가는 코드"와 "실서비스" 사이의 필수 관문

코드가 완성돼도 아래를 통과하기 전에는 오픈하지 않는다. 각 항목은 담당(코드=Fable 5 세션 / 운영자=계정·행정)을 표기.

**① 법적 필수 (한국 실서비스 요건)**
- [ ] 개인정보처리방침 페이지 + 이용약관 페이지 (코드: 페이지 구현 / 운영자: 내용 확정). 카카오 로그인 검수의 필수 제출물이기도 하다.
- [ ] 가입 시 개인정보 수집·이용 동의 체크박스 — 전화번호는 선택 동의 항목으로 분리, 동의 일시 기록 (코드) ※ M0 요구사항에 포함
- [ ] 유료 판매(시즌권) 개시 전 **통신판매업 신고** + 사이트 푸터에 사업자 정보·환불 규정 표기 (운영자)
- [ ] 환불 정책 명문화: 시즌 시작 전/후, 회차 미participation 등 케이스별 (운영자 확정 → 코드 반영)

**② 인증 실전환**
- [ ] 카카오 앱 프로덕션 리다이렉트 URI 등록, 비즈 앱 전환 + 검수 통과 (운영자) — 검수 전에는 등록된 테스트 계정만 로그인 가능함을 잊지 말 것
- [ ] 세션 만료·재로그인·탈퇴 후 재가입 시나리오 테스트 (코드)

**③ 보안 검증**
- [ ] RLS 침투 테스트: 익명/타인 계정으로 모든 테이블 read/write 시도하는 테스트 스크립트 작성·통과 (코드)
- [ ] service_role 키가 클라이언트 번들에 없는지 검사, API 라우트 rate limit (코드)
- [ ] 운영자 권한 우회 시도 테스트: is_operator=false 계정으로 대시보드 API 직접 호출 (코드)

**④ 품질 게이트**
- [ ] 실기기 테스트: iOS Safari + Android Chrome에서 여정 ①~⑥ 전체 통과 (운영자+코드)
- [ ] Lighthouse 모바일: 성능·접근성 80+ (코드)
- [ ] Supabase 자동 백업 활성 확인 + 복구 절차 1회 리허설 (운영자)
- [ ] Sentry에 실제 에러가 잡히는지 강제 에러로 검증 (코드)

**⑤ 운영 준비**
- [ ] 문의 채널(카카오 채널 또는 이메일) 푸터 노출 (운영자)
- [ ] 오픈 첫 주 모니터링 루틴: 매일 Sentry + KPI 대시보드 확인 (운영자)

## D2. 세션 운영
- 세션 1개 = 마일스톤 1개(M0+M1은 묶음 허용). 순서: M0+M1 → M2 → M3 → M5 → M4.
- 매 세션: 계획 제시 → 운영자 승인 → 구현 → 완료 기준 자체 검증 → CLAUDE.md 갱신.
- 9월 시즌 1 개막이 하드 데드라인. M5까지가 개막 전 필수, M4는 개막과 병행 가능(단 법적 검증은 즉시).

## D3. 운영자 액션 아이템 (코드 밖)
- [ ] 카카오 개발자 앱 등록 + Supabase 키 등록
- [ ] 통합 대상 북클럽 목록(이름·장소·일정·인원·승인제 여부) → 시드 입력값
- [ ] 거인의 어깨 인물 전체 목록 추출 → M4 검증 입력값
- [ ] 레퍼런스 이미지 2장 `/design-refs` 저장 — `keycap-button.png`(북클럽 둘러보기 키캡, 시그니처 CTA 기준), `flipnote-icon.jpeg`(플립 노트 브랜드 오브젝트)
- [ ] 7월 선판매 실행(외부 결제 링크, 12만/15만 A/B) — 결과가 M5 상품 가격의 입력값
- [ ] 서초구 계약/지원 실조건 문서화 → B2G 리포트 요구사항의 입력값
