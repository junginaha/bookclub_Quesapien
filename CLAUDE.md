# CLAUDE.md — 질문하는 사람들 / Qsapiens 2.0

이 파일은 MASTER.md(제품 스펙 · 비즈니스 근거 · 세션 운영 규칙)의 부속 문서로,
세션 간 진행 상태·결정 사항·미해결 이슈를 기록한다. **MASTER.md가 우선**하며,
이 파일은 그 실행 기록이다.

---

## 세션 로그

### 2026-07-25~26 — 배포 파이프라인 복구 + 발제 생성기 2단계 엔진 전환 + MASTER.md PART B0

**배포 파이프라인 (2026-07-25)**

- 운영자가 "작업한 게 실반영 안 된다"고 보고. 원인: 최근 6개 커밋이
  `qsapiens-auth-offline-club` 브랜치에만 있었고 Vercel 프로덕션이 추적하는
  `main`은 그보다 4개 더 뒤처져 있었음(둘 다 병합 안 됨). `main`을 fast-forward
  머지 후 push해 프로덕션 배포 트리거 — 해결.
- **⚠ 별도로 발견한 심각한 문제 (미해결)**: Vercel Production 환경변수
  (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `ADMIN_KEY`, `ADMIN_EMAILS`,
  `NEXT_PUBLIC_SITE_URL`)이 전부 빈 문자열(`""`)로 설정돼 있음(`vercel env pull`로
  확인). 이 상태로는 배포가 성공해도 Supabase/Claude API 연동이 전부 죽어있다.
  로컬 `.env.local`의 Supabase 프로젝트 호스트(`smoehxmgnnaulrxjkqvm.supabase.co`)도
  현재 DNS 자체가 해석되지 않음(NXDOMAIN) — 프로젝트가 삭제/변경됐을 가능성.
  **운영자가 Supabase 대시보드에서 프로젝트 상태를 확인하고, Vercel Production
  환경변수를 실제 값으로 재설정해야 한다.** 이것이 지금 프로덕션에서 발제
  생성기가 항상 "닮은 인물/10년 전의 나" 같은 제네릭 fallback만 내놓던 근본 원인이었다
  (`ANTHROPIC_API_KEY`가 빈 문자열 → falsy → 항상 fallback 분기로 빠짐).
- 홈 "참여는 세 걸음이면 돼요" 섹션을 "처음 온 당신에게" 토글 버튼 뒤로 접고 히어로
  스크롤 큐 바로 아래로 이동(간격 타이트하게), 문구 갱신 + 마무리 문장 추가.
  "이 다섯 권, 24명의 투표로…" 선정 배경 문구 삭제.

**발제 생성기 2단계 엔진 전환 (2026-07-26)**

운영자가 발제 품질 문제(범용 질문 반복, 책 핵심 개념 미반영, 거인의 어깨가 장식화)를
지적하며 상세 스펙을 전달 — 아래처럼 구현했다.

- `src/lib/discussionEngine.ts` 신규: 1단계 `analyzeBook()`(책 분석 — 핵심주장/
  핵심개념 3~5/내부긴장 3/전제/반론/현대적 연결/confidence), 2단계
  `generateDiscussion()`(분석 결과 + 관점카드 로스터를 근거로 발제 10개 —
  대화시작2/심화5/거인의 시선2/마무리1, 각 질문에 concept·intent·followup·
  thinker 필드). `validateDiscussion()`으로 범용 질문·예/아니오 질문·중복·개념
  미연결·거인 시선 다양성 부족을 휴리스틱 검사하고, 실패한 항목만
  `regenerateFailedQuestions()`로 1회 재생성(전체 재생성 안 함). 기존
  `getFallback()`(고정 템플릿) 완전 삭제 — AI 실패 시 명확한 에러 코드
  (`config_missing`/`insufficient_description`/`timeout`/`rate_limited`/
  `invalid_json`/`network_error`/`api_error`)만 반환, 더미 질문 없음.
- `src/data/giantPerspectives.ts` 신규: 발제 전용 "관점카드" 12명(소크라테스·
  플라톤·아리스토텔레스·공자·노자·몽테뉴·칸트·밀·키르케고르·도스토옙스키·
  니체·톨스토이). 몽테뉴 외 11명은 `giants.ts`(87명, 사망 70년 1차 스크리닝
  통과)의 core_idea/key_works를 재정리한 것이고, 몽테뉴(1592년 몰)는 사후 430년
  이상이라 사망 70년 규칙과 무관해 신규 추가. 인용은 quotable=true인 인물만,
  안전하게 검증 가능한 짧은 문장만 넣었다.
- `/api/discussion/generate` 전면 재작성: `mode: "book"`(제목/작가 필수+설명
  선택, 기본 모드) / `mode: "free"`(기존 문장 입력, 보조 모드) 둘 다 같은 엔진
  사용. 결과는 `giant_discussions.discussion_questions`(문자열 배열, 기존
  아카이브 탭 호환용 flatten)와 `source_messages`(analysis/giants/opening_lines/
  questions 전체 구조, JSONB) 양쪽에 저장.
- `DiscussionGenerator.tsx` 전면 재작성: 기본 입력을 책 제목/작가/설명으로
  단순화하고 "세부 설정"(발제 방향 4종, 모임 깊이 3종)은 접이식 패널로. 기존
  자유 문장 입력은 보조 모드로 유지. 랜딩(`variant="landing"`)은 발제 3개
  미리보기 + `/giants?handoff=1`로 이동(전체 결과는 `sessionStorage`로 핸드오프,
  새 API 라우트 없이 클라이언트에서만 처리). `/giants`(`variant="giants"`)는
  전체 결과(오프닝 3문장/핵심 긴장 3/거인의 시선 배지/발제 10개 stage 표시/
  진행자 메모) + 복사·재생성·수정.
- `GiantsClient.tsx`의 "니체, 칸트, 소크라테스, 도스토옙스키의 통찰을 빌려" 고정
  문구를 "12명의 사상가 중 이 책과 맞닿는 지지·비판 관점 2명을 골라"로 정정
  (실제 동작과 문구가 다르다는 지적을 반영).

**⚠ 미검증 — 다음 세션에서 반드시 확인**

이번 세션은 **로컬 `.env.local`에도 `ANTHROPIC_API_KEY`가 아예 없고, 프로덕션도
빈 문자열**이라 실제 책 3권(『소크라테스의 변명』·『어떻게 민주주의는 무너지는가』·
『나는 메트로폴리탄 미술관의 경비원입니다』)으로 살아있는 API 호출 테스트를 한 번도
하지 못했다. `validateDiscussion()` 휴리스틱은 손으로 만든 샘플 질문 세트로만
단위 검증했다(`npx tsx`로 즉석 스크립트 실행, 통과 확인 후 삭제). `npm run build`
전체 통과, 타입체크 통과. **운영자가 실제 `ANTHROPIC_API_KEY`를 로컬/Vercel에
넣어준 뒤, 위 3권으로 실제 생성 결과의 질문 구조·개념 반영·거인의 시선 다양성을
직접 확인해야 완료로 볼 수 있다.** 헤드리스 브라우저(모바일 360px 시각 검증)도
이 샌드박스에 root 권한이 없어 Chromium 구동 라이브러리(libnspr4 등) 설치가
불가능해 실행하지 못했다 — CSS clamp/media query 리뷰로만 대체했다.

---

### 2026-07-17 — 거인의 어깨 → 발제 생성기(계산기 모드) 전환

**범위 결정 (운영자 지시)**
1. 홈 "AT HEART" 섹션과 `/giants`의 철학자 인물 그리드/개별 상세(AI 대화·명언·위키)를 전부
   내리고, 책/문장 입력 → 발제 10개 생성하는 단일 목적 "계산기 모드" 생성기로 전환.
2. `/giants/[person]`은 삭제가 아니라 `/giants`로 블라인드 리다이렉트(코드는
   `GiantDetailClient.tsx`로 git에 남아있으나 unimport 상태 — 절대 원칙 7과도 부합, 인물
   개별 노출이 사라져 사망 70년 규칙 리스크도 줄어듦).
3. 발제 프롬프트가 책의 구체적 요소(anchors)를 먼저 짚게 하고, 매 요청마다 GIANTS 87명
   로스터 순서를 셔플해 반복/일반론 문제를 완화(`src/app/api/discussion/generate/route.ts`).
4. 발제 생성 성공 시 `giant_discussions`에 자동 저장(발제 데이터화), 응답에 `discussionId`
   추가.
5. 복사 기능은 "서비스 피드백 원탭(Smile/Meh/Frown) 이후에만" 노출 — 비활성 버튼이 아니라
   피드백 전엔 복사 버튼 자체를 숨기는 "보상형 노출" 패턴. 브라우저당 1회만 요구
   (localStorage), 이후 생성부터는 바로 복사 가능. 피드백은 `discussion_feedback` 신규
   테이블에 저장(`supabase/migrations/015_discussion_feedback.sql`).
6. `GiantsClient.tsx`/`LandingPage.tsx` 두 곳에 중복 구현하던 폼/결과 UI를
   `src/components/discussion/DiscussionGenerator.tsx` 공용 컴포넌트로 추출
   (`variant="giants"|"landing"`), 네이비/골드 톤앤매너는 그대로 유지.

**⚠ 미검증 — 다음 세션에서 반드시 확인**

이 실행 환경은 라이브 Supabase에 네트워크 접근이 없어(008~014와 동일 제약)
`015_discussion_feedback.sql`이 아직 실제 DB에 적용되지 않았다. `npm run build`는
전체 통과했고 `/api/discussion/generate`·`/api/discussion/feedback`은 DB insert 실패를
삼키고 200을 반환하도록 짜여 있어 마이그레이션 미적용 상태에서도 UI 자체는 깨지지 않지만,
발제 데이터화·피드백 저장·아카이브 반영은 운영자가 015를 Supabase 대시보드 SQL 에디터에
적용한 뒤에만 실제로 동작한다. 적용 후 `/archive`의 "발제문 아카이브" 탭에 생성기발 발제가
정상적으로 쌓이는지, `discussion_feedback`에 반응/코멘트가 실제로 들어가는지 확인 필요.

---

### 2026-07-04~07 — M0(인증·회원) + M1(오프라인 북클럽 연계)

**범위 결정 (운영자 승인 완료)**
1. 인증: 카카오 OAuth 추가, 기존 이메일/비번 + Google 로그인은 유지(점진 전환). 완전 전환은 후속 세션.
2. profiles 테이블: 기존 컬럼(email, name, avatar_url, bio, session_count) 유지 + 신규 컬럼(nickname, phone, home_region, is_operator 등)을 ALTER로 추가. DROP 없음.
3. 클럽/모임 데이터 모델: `clubs`/`memberships`/`meetings`/`meeting_attendances`를 신규 테이블·신규 화면(`/clubs`)으로 별도 구축. 기존 `landing_book_clubs`(`/bookclub`, 잼잼 등 실데이터)와 `sessions`/`questions`(질문 기반 회차)는 이번 세션에서 손대지 않음. 정식 이관은 다음 세션 논의 대상.
4. 홈 화면: 기존 `LandingPage.tsx`의 히어로·섹션들은 그대로 두고, "내 근처 다음 모임" 피드 섹션(`NearbyMeetingsFeed`)만 히어로 바로 아래에 추가.
5. CLAUDE.md: 이 저장소에 파일이 없어 이번 세션에 신규 생성.

**완료된 작업**

- **C0 기술 기반**: `supabase/migrations/008_extensions_and_events.sql`(postgis/vector extension, `events` KPI 테이블 + RLS), `src/lib/events.ts`(`logEvent` 헬퍼), `src/lib/time.ts`(Asia/Seoul 표시 유틸), `src/lib/admin.ts`에 `isOperator()` 신규 헬퍼 추가(기존 `ADMIN_EMAILS`/`isAdminEmail`은 유지), `@sentry/nextjs` 설치 + `src/instrumentation.ts`/`src/instrumentation-client.ts`(Turbopack 대응 — `sentry.client.config.ts` 대신 Next.js 15 `instrumentation-client` 컨벤션 사용)/`sentry.server.config.ts`/`sentry.edge.config.ts`/`next.config.ts`(`withSentryConfig`), `src/app/api/debug/sentry-test/route.ts`(운영자 전용 강제 에러).
- **M0**: `supabase/migrations/009_profiles_v2.sql`(profiles ALTER: nickname/phone/home_region/is_operator/privacy_consented_at/phone_consented_at/deactivated_at/onboarding_completed_at, `revoke update(is_operator)`, `handle_new_user()` 트리거 갱신, `anonymize_profile()` 함수). 카카오 로그인 버튼(`LoginForm.tsx`/`SignupForm.tsx`), `PrivacyConsentGate.tsx`(가입 시 필수 동의 체크박스), `auth/callback/route.ts`(동의 기록 + `onboarding_completed_at` 기준 신규유저 판별), `/onboarding/profile`(닉네임/전화번호/관심지역 3탭 온보딩), `/mypage` 온보딩 가드, 마이페이지 탈퇴 버튼(`/api/account/deactivate`), `/privacy`·`/terms` 페이지 골격(내용은 TBD), Footer 링크.
- **M1**: `supabase/migrations/010_clubs_meetings.sql`(clubs/memberships/meetings/meeting_attendances + RLS, `apply_to_meeting()`/`cancel_attendance()` SECURITY DEFINER 함수로 정원·대기열·승인제를 원자적으로 처리, `handle_attendance_to_membership` 트리거로 첫 참석 시 자동 멤버 전환, `get_meeting_seats()`/`get_club_member_count()`/`clubs_within()` 공개 집계 함수). `/clubs`, `/clubs/[slug]`(분위기 우선: FAQ/후기발췌/멤버수/다음모임카드+즉시참여 키캡), `/api/clubs/nearby`, `/api/meetings/[id]/apply`·`/cancel`, 홈 히어로 아래 `NearbyMeetingsFeed` 섹션, `/admin/meetings` 운영자 대시보드(클럽/회차 CRUD, 참가자 승인/출석/노쇼 처리).
- **키캡 버튼**: `.btn-keycap`이 이미 프로덕션에 존재(`globals.css`, `KeycapSound.tsx`, 홈 히어로 "북클럽 둘러보기")했음을 감사 중 확인 — 새로 만들지 않고 재사용. 운영자가 세션 중 실제 레퍼런스 이미지(BMJUA 폰트, 크림/아이보리 텍스트)를 제공해 대조한 결과, 기존 코드가 흰색(`#FFFFFF`)·Noto Sans KR로 되어 있던 것을 `var(--q-ivory)`(#F5EFD8)·`"BMJUA"`로 수정. `--q-cobalt`/`--q-cobalt-deep`/`--q-glow`/`--q-ivory` 토큰을 `globals.css` `:root`에 추가하고, BMJUA 폰트 CDN(`https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/BMJUA.css`)을 `layout.tsx`에 추가. 신규 사용처는 클럽 상세의 "즉시참여" 1곳(`MeetingApplyButton`)뿐.
- **보안 수정 (세션 중 발견)**: 기존 `profiles_select_all` 정책(`for select using (true)`, 001_initial.sql)이 profiles 테이블을 anon 포함 누구에게나 전체 컬럼 공개하고 있었는데, 이번 마이그레이션이 여기에 `phone`(전화번호)·`home_region`(정확한 거주지 좌표)을 추가하므로 그대로 두면 비로그인 상태에서 REST API로 모든 회원의 전화번호·집 위치를 긁어갈 수 있는 새 개인정보 유출 취약점이 생김. `009_profiles_v2.sql`에서 `revoke select (phone, home_region) on public.profiles from anon;`으로 최소 침습적으로 막음(authenticated 롤은 건드리지 않음 — 기존 `select("*")` 호출부가 깨지지 않도록). **더 넓은 문제**(= `profiles_select_all` 자체가 email 등도 인증된 모든 회원에게 공개하는 기존 설계)는 이번 세션 범위 밖이라 [TBD]로 남김.

**⚠ 완료 기준 검증 — 부분적으로만 가능했음 (중요, 다음 세션에서 반드시 확인)**

이 실행 환경은 Supabase 라이브 DB에 대한 아웃바운드 네트워크 접근이 전혀 없다
(`getaddrinfo ENOTFOUND smoehxmgnnaulrxjkqvm.supabase.co`, dev 서버로 직접 확인함).
그리고 Supabase CLI가 링크된 프로젝트(`pgstyeddzbjoijmmnuuw`)와 앱이 실제 쓰는
프로젝트(`smoehxmgnnaulrxjkqvm`, `.env.local` 기준)가 서로 달라 `db push`도 불가능했다.
**따라서 008/009/010 마이그레이션은 아직 실제 DB에 적용되지 않았다.**

실제로 확인한 것:
- `npm run build` 전체 통과 (모든 신규 라우트 포함, 71개 페이지).
- dev 서버로 홈(`/`)이 DB 연결 실패 상황에서도 200으로 정상 응답(내가 추가한 `.catch(() => [])` 폴백이 의도대로 동작).
- `/privacy`, `/terms` 골격 페이지 200 응답.
- `/clubs`는 최초 500(미처리 에러) → `getClubs().catch(() => [])` 폴백 추가 후 재확인 필요(DB 미연결 상태라 로컬에서 200 확인은 못했지만, 홈과 동일 패턴이라 안전할 것으로 판단).

**아직 확인 못한 것 — 마이그레이션 적용 후 반드시 재검증 필요**:
- M0 완료 기준: 실제 로그인(카카오 또는 Google)으로 콜백→`/onboarding/profile`→`/mypage` 60초 시나리오.
- M1 완료 기준: 실제 클럽 데이터 1건을 `/admin/meetings`로 입력 → 비로그인 방문자가 `/clubs`에서 발견 → 가입 → 회차 신청 → 다음 회차 확인까지 3분 시나리오.
- `node --env-file=.env.local scripts/rls-pentest.mjs` 실행 및 전체 통과 확인.
- Sentry 강제 에러(`/api/debug/sentry-test`) 캡처 확인(DSN 미설정 상태라 현재는 no-op).

**빌드 통과 ≠ 완료**라는 원칙(MASTER.md 절대 원칙 5)에 따라, 위 항목이 실제로 통과할 때까지
이번 세션의 M0/M1은 "코드 작성 완료, 실환경 검증 대기" 상태로 간주한다.

**DB 마이그레이션 적용 방법 (운영자 액션 필요)**

`supabase/migrations/008_extensions_and_events.sql`, `009_profiles_v2.sql`,
`010_clubs_meetings.sql` 세 파일을 **이 순서 그대로** Supabase 대시보드 SQL 에디터에
붙여넣어 실행해야 한다. 적용 후 다음 세션(또는 이번 세션 재개 시)에 위 미검증 항목을
전부 확인한다.

---

## 미해결 이슈 / TBD

1. **`profiles_select_all` 정책 자체가 이미 email 등을 인증된 모든 회원에게 공개**하는
   기존(2.0 이전) 설계다. 이번엔 phone/home_region만 anon으로부터 막았고,
   authenticated 롤 기준으로는 여전히 다른 회원의 phone/home_region을 `select`로 볼 수
   있다. 근본적으로 고치려면 `profiles_public` 뷰 분리 + 기존 호출부 리팩터링이
   필요하며, 라이브 DB에서 실제로 테스트하며 진행해야 한다(이번 세션은 그 환경이 없었음).
   **운영자 확인 필요.**
2. **키캡 버튼 hover 상태 잔여 이슈**: `src/components/home/landing.css`의
   `.lp-hero-bookclub-btn.btn-keycap:hover` 규칙이 `color: #FFFFFF !important`를
   그대로 갖고 있어, 홈 히어로의 키캡 버튼만 hover 시 잠깐 흰색으로 보인다(기본 상태는
   이미 크림색으로 정상). 이 파일은 세션 시작 전부터 이미 관련 없는 별도의
   미커밋 변경(히어로 리디자인, "질문 남겨보기" 섹션 제거 등)이 있어 이번 세션에서는
   건드리지 않았다. 다음 세션에서 이 파일의 기존 변경사항을 확인한 뒤 함께 정리 요망.
3. `/bookclub`(구, `landing_book_clubs`) vs `/clubs`(신규) 이관 일정/방식 — 이번 세션은
   병존시키기만 했음. 정식 이관(또는 유지 결정)은 운영자 논의 필요.
4. `/admin/clubs`(구) vs `/admin/meetings`(신규) 운영자 대시보드 정리 방향.
5. 지오코딩 API(카카오 로컬 등) 정식 연동 여부 — 현재 "내 근처"는 브라우저
   Geolocation만 사용하고, 지역명 검색은 `location_name` 텍스트 매칭으로 단순 구현됨.
6. **배포 규칙 · 브랜드 카피 보호 규정** — MASTER.md가 "기존 CLAUDE.md 규칙"이라 언급하지만
   이 저장소에는 원래 CLAUDE.md가 없었다. 사망 70년 규칙(§원칙7)과 가짜 데이터 금지(§원칙8)는
   MASTER.md 본문에서 직접 추론해 아래에 반영했지만, 배포 규칙과 브랜드 카피 보호의
   구체적 내용은 운영자가 확정해야 한다. **[TBD]**
7. 카카오 개발자 앱이 아직 등록되지 않았다(D3 운영자 액션 아이템) — 등록 전에는
   테스트 계정만 로그인 가능하고, Supabase Auth 대시보드에 카카오 provider도 활성화되어야
   버튼이 실제로 동작한다.
8. `/privacy`, `/terms` 페이지는 골격만 있고 조항 내용(개인정보 항목, 환불 규정,
   사업자 정보 등)은 운영자 확정 전까지 `[운영자 확정 필요]` 플레이스홀더 상태다.
   유료 판매 개시 전 통신판매업 신고 + 사업자 정보 표기 필수(§D1.5①).

---

## 절대 원칙 (MASTER.md에서 계승, 요약)

1. 참여 단위는 클럽이 아니라 회차. 홈은 "내 근처 다음 모임" 피드.
2. 디자인은 리디자인이 아니다 — 기존 감성 계승, 새 요소는 키캡 버튼 하나뿐(화면당 1개).
3. 스키마는 마이그레이션 파일로 작성하고 RLS를 전면 적용한다.
4. 스펙에 없는 구조·디자인 변경은 임의로 하지 않고 운영자에게 묻는다.
5. 완료 기준을 스스로 실행·검증한 뒤에만 완료를 선언한다. 빌드 통과 ≠ 완료.
6. 세션 종료 시 이 파일에 진행 상태·결정 사항·미해결 이슈를 갱신한다.
7. **거인의 어깨 관련 콘텐츠는 M4의 법적 검증(사망 70년 규칙)이 끝나기 전까지 신규 노출 금지.**
   이번 세션은 M0/M1만 다뤘으므로 거인의 어깨 콘텐츠에 손대지 않았다 — 이 제약은 계속 유효.
8. **가짜 데이터 금지.** 이번 세션은 시드를 넣지 않았다 — 완료 기준 검증 시 운영자가
   제공하는 실제 클럽 정보(예: 잼잼)를 `/admin/meetings`로 직접 입력해 사용할 것.
9. 실서비스 게이트(§D1.5)의 코드 항목은 해당 마일스톤에 포함 — M0에 개인정보 동의
   체크박스, 약관/개인정보처리방침 페이지 골격, RLS 침투 테스트 스크립트 포함 완료.

---

## 다음 세션 순서

MASTER.md D2 기준: M0+M1 → **M2** → M3 → M5 → M4.

M2(아카이빙) 착수 전, 이번 세션의 미검증 항목(마이그레이션 적용 + 완료 기준 시나리오 +
RLS 펜테스트)을 먼저 통과시키는 것을 권장한다.
