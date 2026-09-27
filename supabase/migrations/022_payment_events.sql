-- PayApp 결제 통보의 중복 처리를 막고 결제 상태를 감사할 수 있는 원장.
create table if not exists public.payment_events (
  id bigint generated always as identity primary key,
  provider text not null default 'payapp',
  provider_payment_id text not null,
  state text not null,
  amount integer,
  product_ref text,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider, provider_payment_id, state)
);

create index if not exists payment_events_created_at_idx
  on public.payment_events (created_at desc);

alter table public.payment_events enable row level security;
-- 클라이언트 정책 없음. 서버 service_role만 읽기/쓰기한다.
