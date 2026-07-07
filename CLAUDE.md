# CLAUDE.md — 질문하는 사람들 / Quesapience 2.0

이 파일은 MASTER.md(제품 스펙 · 비즈니스 근거 · 세션 운영 규칙)의 부속 문서로,
세션 간 진행 상태·결정 사항·미해결 이슈를 기록한다. **MASTER.md가 우선**하며,
이 파일은 그 실행 기록이다.

---

## 세션 로그

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
