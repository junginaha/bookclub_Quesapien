# 질문하는 사람들

> 책으로 시작된 질문은 사람을 연결합니다.

미래혁신형 북클럽 플랫폼 · 서초구 선정 프로젝트

---

## 서비스 소개

**질문하는 사람들**은 질문 중심의 북클럽 플랫폼입니다.  
단순한 독서모임을 넘어, 질문이 사람과 사람을 연결하는 공간입니다.

- 질문 기반 모임 생성 및 참여
- AI 발제문 자동 생성
- 생각 변화 기록 (후기 아카이브)
- 실시간 참여 가능 모임 확인

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v3 |
| UI 컴포넌트 | shadcn/ui |
| 백엔드/인증 | Supabase |
| AI | Anthropic Claude API |
| 배포 | Vercel |

---

## 폴더 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 인증 페이지 그룹 (레이아웃 공유 없음)
│   │   ├── login/
│   │   └── signup/
│   ├── api/ai/             # AI 발제 생성 API
│   ├── archive/            # 후기 아카이브
│   ├── mypage/             # 마이페이지
│   ├── questions/
│   │   ├── [id]/           # 질문 상세
│   │   └── create/         # 발제 만들기
│   ├── globals.css
│   ├── layout.tsx          # 루트 레이아웃
│   └── page.tsx            # 홈
├── components/
│   ├── auth/               # 인증 폼
│   ├── common/             # Header, Footer
│   ├── home/               # 홈 섹션들
│   ├── questions/          # 질문 관련
│   ├── reviews/            # 후기 관련
│   └── ui/                 # shadcn UI 기본 컴포넌트
├── data/
│   └── mockData.ts         # 개발용 목업 데이터
├── lib/
│   ├── supabase/           # Supabase 클라이언트
│   ├── anthropic.ts        # Anthropic AI 클라이언트
│   └── utils.ts            # 유틸리티 함수
└── types/
    └── index.ts            # 전역 타입 정의
```

---

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열어 실제 값을 입력하세요:

```env
# Supabase 프로젝트 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic API 키
ANTHROPIC_API_KEY=sk-ant-...

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인하세요.

---

## Supabase 설정

### 테이블 스키마

```sql
-- 사용자 프로필
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null,
  avatar_url text,
  bio text,
  joined_at timestamptz default now(),
  session_count int default 0
);

-- 발제 질문
create table questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,
  tags text[] default '{}',
  author_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  session_count int default 0,
  participant_total int default 0,
  is_featured boolean default false
);

-- 모임 세션
create table sessions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references questions(id) on delete cascade,
  host_id uuid references profiles(id) on delete cascade,
  location text not null,
  address text,
  date date not null,
  start_time time not null,
  end_time time not null,
  max_participants int default 8,
  current_participants int default 0,
  status text default 'upcoming' check (status in ('upcoming', 'live', 'closed')),
  created_at timestamptz default now()
);

-- 후기
create table reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  author_id uuid references profiles(id) on delete cascade,
  type text default 'text' check (type in ('text', 'photo', 'video')),
  content text not null,
  photo_url text,
  video_url text,
  quote text,
  transformation text,
  created_at timestamptz default now(),
  likes int default 0
);

-- RLS 정책 활성화
alter table profiles enable row level security;
alter table questions enable row level security;
alter table sessions enable row level security;
alter table reviews enable row level security;

-- RLS 정책 예시
create policy "공개 프로필 조회" on profiles for select using (true);
create policy "공개 질문 조회" on questions for select using (true);
create policy "공개 세션 조회" on sessions for select using (true);
create policy "공개 후기 조회" on reviews for select using (true);

create policy "본인 프로필 수정" on profiles for update using (auth.uid() = id);
create policy "인증 사용자 질문 생성" on questions for insert with check (auth.uid() = author_id);
create policy "인증 사용자 세션 생성" on sessions for insert with check (auth.uid() = host_id);
create policy "인증 사용자 후기 생성" on reviews for insert with check (auth.uid() = author_id);
```

---

## 배포 (Vercel)

### 1. Vercel에 연결

```bash
npx vercel
```

### 2. 환경변수 설정

Vercel 대시보드 → Settings → Environment Variables에서 `.env.local`과 동일한 변수들을 추가합니다.

### 3. 배포

```bash
npx vercel --prod
```

또는 GitHub 레포지토리를 Vercel에 연결하면 `main` 브랜치 push 시 자동 배포됩니다.

---

## 주요 페이지

| 경로 | 설명 |
|------|------|
| `/` | 홈 — Hero, 오늘의 질문, 참여 가능 모임, 후기, 인기 질문 |
| `/questions/create` | 발제 만들기 — 직접 작성 / AI 자동 생성 |
| `/questions/[id]` | 질문 상세 — 토론 질문, 예정 모임, 후기 |
| `/archive` | 후기 아카이브 — 필터링, 사진/영상/텍스트 |
| `/login` | 로그인 |
| `/signup` | 회원가입 |
| `/mypage` | 마이페이지 — 참여 이력, 후기, 통계 |
| `/api/ai` | AI 발제 생성 API (POST) |

---

## 라이선스

MIT
