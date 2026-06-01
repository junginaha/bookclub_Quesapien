-- ============================================================
-- UT 설문 응답 테이블
-- ============================================================
create table public.ut_responses (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  answers     jsonb not null default '{}'
);

-- 서비스 롤로만 읽기/쓰기 허용 (RLS 비활성화 상태에서도 anon은 insert만 허용)
alter table public.ut_responses enable row level security;

-- 누구나 제출 가능
create policy "anyone can insert"
  on public.ut_responses for insert
  to anon, authenticated
  with check (true);

-- service_role 만 조회 가능 (결과 API 는 서버에서 service key 사용)
create policy "service role can select"
  on public.ut_responses for select
  to service_role
  using (true);

create policy "service role can delete"
  on public.ut_responses for delete
  to service_role
  using (true);
