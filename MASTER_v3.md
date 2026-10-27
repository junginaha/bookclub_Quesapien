# 질문하는 사람들 (Qsapiens) — MASTER v3 · 전면개편

> 목표: 대한민국 최고의 북클럽. 핵심 가치: **다정함**.
> 기준: 참여까지의 마찰 0 + 참여 후의 다정함. 기능 수가 아니라 사람이 돌아오게 만드는 경험.
> 범위: 질문하는 사람들 단일 서비스. 다른 사업 연결 금지.

---

## 0. 원칙 (모든 화면·카피·코드에 적용)

1. **예약은 3탭 이내.** 카카오 1탭 → 날짜 확인 → 완료. 회원정보 입력은 예약 *후*, 선택.
2. **거절 없는 화면.** 빈 결과·오류·마감 어디서도 막다른 길 없음. 항상 다음 행동 1개 제시.
3. **질문이 먼저.** 카드·상세·공유 이미지 모두 책 제목보다 '질문 1개'가 앞에.
4. **AI를 팔지 않는다.** 가치는 질문의 질, 사람, 경험, 결과로 표현. 'AI 발제' 류 문구 금지.
5. **수직 표현 금지.** '운영진' 사용 금지 → '여는 사람', '함께 읽는 사람'.
6. **후기·수치 창작 금지.** 실제 데이터만 노출. 없으면 섹션 숨김.
7. **모바일 퍼스트.** 모든 화면 390px 기준 설계 후 데스크톱 확장.

---

## 1. 정보구조 (IA)

```
/                    홈
/clubs               북클럽 찾기 (리스트 · 지도 · 달력 — 3개 뷰, 1개 URL + 쿼리)
/clubs/[slug]        북클럽 상세 (SEO 단위 페이지)
/clubs/[slug]/book   예약 (bottom sheet 우선, 직접 진입 시 풀페이지)
/open                함께 여는 북클럽 (대기·투표 중인 클럽 목록)
/open/[slug]         함께 여는 북클럽 상세 (게이지 · 초대 · 날짜투표)
/request             읽고 싶은 책 요청
/me                  내 북클럽 (예약·대기·지난 모임)
/guide/first-time    처음 오시는 분께 (장소·분위기·진행 방식)
/login               카카오 로그인 (리다이렉트 보존)
```

삭제: 거인의 어깨 발제 생성기, 프레젠테이션 스튜디오, 별도 아카이브 페이지.
아카이빙: 북클럽 상세 하단 '지난 기록' 탭에 유튜브·블로그 링크만.

---

## 2. 홈 (/)

세로 순서. 각 섹션은 데이터 없으면 렌더 안 함.

### 2-1. 히어로
- 한 줄: **"질문 하나로 시작하는 북클럽"**
- 서브: "책을 다 읽지 않아도 괜찮아요. 질문 하나만 들고 오세요."
- CTA 1개: **내 근처 북클럽 찾기** (위치 권한 → /clubs?view=map)
- 보조 링크: 달력으로 보기 (/clubs?view=calendar)

### 2-2. 지금 열리는 북클럽
- 가로 스크롤 카드 (최대 8개, 모집 중 + 날짜 임박순)
- 카드 구성: 질문 1개(큰 글씨) · 책 제목·저자(작은 글씨) · 날짜·요일·시간 · 장소(동 단위) · 남은 자리 · [예약하기]
- 남은 자리 2 이하: "2자리 남았어요" (경고색 아님, 따뜻한 강조)

### 2-3. 함께 여는 북클럽
- 섹션 설명: "5명이 모이면 열려요. 지금 함께 열어볼까요?"
- 카드: 질문 1개 · 책 · **진행 게이지 (3/5)** · [나도 열래요]
- 반응 좋았던 지난 북클럽 앵콜 + 새로 기획된 북클럽 혼합, 게이지 높은 순

### 2-4. 읽고 싶은 책이 있나요?
- 검색 입력 1개. 결과 없으면 → "아직 없어요. 요청하면 함께 열어볼게요." → /request

### 2-5. 처음 오시는 분께
- 사진 1장 + 3줄 + [자세히] → /guide/first-time

---

## 3. 북클럽 찾기 (/clubs)

- 상단 세그먼트: **리스트 · 지도 · 달력**
- 필터 칩(가로 스크롤): 장르 · 요일 · 시간대(오전/오후/저녁) · 거리 · 온라인
- 지도: 내 위치 중심, 핀 탭 → 하단 카드. 핀 없음 → "이 근처엔 아직 없어요. 첫 북클럽을 열어볼까요?" [함께 열기]
- 달력: 월 뷰, 날짜 아래 점 1개=1클럽. 날짜 탭 → 그날 리스트.

---

## 4. 북클럽 상세 (/clubs/[slug])

순서: 질문 1개(히어로) → 책 → 일시·장소·인원 → 여는 사람 한 줄 → 엄선 질문 5개(1개 공개, 4개는 예약 후 공개 — "나머지 질문은 모임에서 함께 열어요") → 진행 방식 3줄 → 지난 기록(있을 때만) → 하단 고정 CTA [예약하기 · 남은 N자리]

SEO/AEO:
- `<title>`: `{질문} | {책} 북클럽 · {동} · {날짜}`
- JSON-LD `Event` (name=질문, about=책 Book 스키마, location, startDate, offers)
- OG 이미지: 질문 텍스트 자동 생성 (1200×630)
- canonical 통일, 지역 키워드 H1 포함

---

## 5. 예약 흐름 (3탭)

```
[예약하기] 탭
  └ 로그인 안 됨 → 카카오 1탭 (완료 후 원래 자리로 복귀, 시트 자동 열림)
  └ 로그인 됨   → bottom sheet
       ┌──────────────────────────┐
       │ 11월 8일 토요일 · 오후 3시   │
       │ 서초동 ○○ · 남은 2자리      │
       │ 이름: (카카오 이름 자동)     │
       │ 연락: (선택) 문자/이메일     │
       │ [예약 완료]                 │
       └──────────────────────────┘
완료 화면 (풀스크린, 다정함의 핵심)
  "○○님, 11월 8일 토요일에 뵙겠습니다.
   책은 어디까지 읽어오셔도 괜찮아요.
   질문 하나만 들고 오세요."
  [캘린더에 추가] [처음 오시나요? 안내 보기] [닫기]
```

- 비회원 예약 허용 옵션(이름+연락처만), 로그인은 나중에 묶기.
- 취소: /me에서 1탭. 확인 문구: "괜찮아요. 다음에 또 뵈어요." 환불 규칙은 그 아래 작게.
- 알림: D-3, D-1, 당일 2시간 전 (카카오 알림톡 or 문자). 문구는 모두 사람 말투.

---

## 6. 함께 여는 북클럽 (/open, /open/[slug])

- 상세: 질문 1개 · 책 · **게이지 "3/5명 모였어요"** · 모인 사람들(이니셜 아바타) · [나도 열래요] · [친구에게 알리기] (링크 복사·카카오 공유)
- 5명 도달 → 전원에게 날짜 투표 알림 (3개 후보, 48시간) → 확정 → 자동으로 /clubs 로 전환
- 앵콜(지난 책) · 신규 기획 동일 UI, 뱃지로만 구분 ("다시 함께" / "새로")

---

## 7. 로그인

- 카카오 단일. 버튼 1개. 설명 1줄: "이름만 가져와요. 다른 건 묻지 않아요."
- 로그인 후 반드시 원래 하던 행동으로 복귀(예약 시트 자동 재오픈).
- 닉네임·프로필은 /me에서 선택 편집.

---

## 8. 빈 상태·오류 카피 (전부 다음 행동 포함)

| 상황 | 카피 | 다음 행동 |
|---|---|---|
| 근처 결과 없음 | 이 근처엔 아직 없어요. 첫 북클럽을 열어볼까요? | [함께 열기] |
| 검색 결과 없음 | 아직 없어요. 요청하면 함께 열어볼게요. | [책 요청하기] |
| 마감 | 이번엔 자리가 다 찼어요. 다음 모임을 알려드릴까요? | [알림 받기] |
| 로그인 실패 | 잠깐 문제가 있었어요. 한 번만 더 눌러주세요. | [다시 시도] |
| /me 비어있음 | 아직 예약한 북클럽이 없어요. 가까운 곳부터 볼까요? | [내 근처 찾기] |

---

## 9. 디자인 시스템 요약

- **톤**: 따뜻한 종이·잉크. 차갑지 않은 중립.
- **컬러**: 배경 #FAF7F2 (warm paper) · 텍스트 #1F1B16 (ink) · 포인트 #D96C3A (terracotta, CTA 전용) · 보조 #6B8F71 (sage, 성공·게이지) · 라인 #E8E1D8
- **타입**: 질문 = Serif 디스플레이 (Noto Serif KR / Nanum Myeongjo, 24–32px, 자간 -0.01em) · 본문 = Pretendard 15–16px, 행간 1.6
- **형태**: 라운드 16px, 그림자 최소(1단계), 카드 테두리 1px
- **모션**: 150–200ms ease-out만. 예약 완료 화면만 400ms fade.
- **접근성**: 본문 대비 7:1, 탭 타깃 44px, 40대 이상 가독성 기준 (최소 15px)

---

## 10. 데이터 모델 변경 (Supabase)

```sql
-- clubs: 기존 유지 + 추가
alter table clubs add column headline_question text not null default '';
alter table clubs add column status text check (status in ('open','waiting','full','done')) default 'open';
alter table clubs add column min_members int default 5;
alter table clubs add column lat double precision, add column lng double precision;
alter table clubs add column slug text unique;
alter table clubs add column archive_links jsonb default '[]';   -- [{type:'youtube'|'blog', url}]

-- questions: 클럽당 5개, 1개만 public
create table club_questions (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete cascade,
  body text not null,
  is_public boolean default false,
  sort int default 0
);

-- 함께 여는: 대기 명단
create table club_waitlist (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete cascade,
  user_id uuid references auth.users(id),
  guest_name text, guest_contact text,
  created_at timestamptz default now(),
  unique (club_id, user_id)
);

-- 날짜 투표
create table club_date_votes (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete cascade,
  candidate_date timestamptz not null,
  user_id uuid references auth.users(id),
  unique (club_id, candidate_date, user_id)
);

-- 책 요청
create table book_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null, author text,
  requester_contact text,
  created_at timestamptz default now()
);
```

트리거: `club_waitlist` 카운트 ≥ `min_members` → `clubs.status='voting'` + 알림 큐 삽입.

---

## 11. 빌드 순서 (Claude Code)

- **M0** 디자인 토큰·컴포넌트 (Button, Card, Chip, BottomSheet, Gauge, EmptyState) — 1일
- **M1** 홈 + /clubs 리스트·달력 + 상세 + SEO(JSON-LD/OG) — 2일
- **M2** 카카오 로그인 복귀 흐름 + 예약 시트 + 완료 화면 + /me — 2일
- **M3** 지도 뷰 (내 근처) — 1일
- **M4** 함께 여는 북클럽 (게이지·초대·날짜투표·트리거) — 2일
- **M5** 알림(D-3/D-1/당일) + 책 요청 + 빈 상태 전수 점검 — 1일
- **M6** 기존 데이터 마이그레이션 · 구 페이지 301 · 라이트하우스 90+ — 1일

배포 규칙 유지: 새 Vercel 프로젝트 생성 금지 (jilmunhaneun-saramdeul 사용).

---

## 12. 완료 기준 (Definition of Done)

- 신규 방문자가 홈 → 예약 완료까지 **3탭·60초** 이내 (실측)
- 모든 빈 상태에 다음 행동 버튼 존재
- 모든 북클럽 상세가 Event JSON-LD 검증 통과
- 모바일 라이트하우스 Performance·SEO·Accessibility 90+
- 카피 전수 검토: 'AI', '운영진', 부정 대조 표현 0건
