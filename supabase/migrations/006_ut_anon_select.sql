-- anon 도 조회 가능하도록 정책 추가 (클라이언트에서 결과 집계)
create policy "anon can select"
  on public.ut_responses for select
  to anon, authenticated
  using (true);
