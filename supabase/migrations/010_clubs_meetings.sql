-- ============================================================
-- Quesapience 2.0 — M1. 오프라인 북클럽 연계
-- clubs / memberships / meetings / meeting_attendances
-- 기존 landing_book_clubs, sessions/questions 는 손대지 않는다(범위 결정 #3).
-- ============================================================

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  location geography(point, 4326),
  location_name text,
  schedule_note text,
  capacity int,
  join_policy text not null default 'open' check (join_policy in ('open', 'approval')),
  vibe jsonb,                              -- FAQ·진행방식·후기발췌 (여정②)
  owner_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.memberships (
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'host', 'member')),
  status text not null default 'active' check (status in ('active', 'pending', 'waitlist', 'left')),
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  book_title text,
  book_isbn text,
  starts_at timestamptz not null,
  place_name text,
  capacity int,                             -- null이면 clubs.capacity 상속
  status text not null default 'scheduled' check (status in ('scheduled', 'done', 'canceled')),
  created_at timestamptz not null default now()
);

create table public.meeting_attendances (
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- pending: 승인제 클럽에서 운영자 승인 대기 / waitlist: 정원 초과 대기열
  status text not null default 'applied' check (status in ('applied', 'pending', 'waitlist', 'attended', 'no_show', 'canceled')),
  created_at timestamptz not null default now(),
  primary key (meeting_id, user_id)
);

create index clubs_location_idx on public.clubs using gist (location);
create index meetings_club_id_idx on public.meetings (club_id);
create index meetings_starts_at_idx on public.meetings (starts_at);
create index memberships_user_id_idx on public.memberships (user_id);
create index meeting_attendances_user_id_idx on public.meeting_attendances (user_id);

-- ============================================================
-- RLS — 공개 콘텐츠(clubs/meetings)는 anon 읽기, 쓰기는 운영자 전용(§C0 is_operator).
-- memberships/meeting_attendances는 본인 행만 조회 가능 — 멤버 수/잔여 좌석은
-- 아래 SECURITY DEFINER 집계 함수(get_club_member_count, get_meeting_seats)로 공개한다.
-- ============================================================
alter table public.clubs enable row level security;
alter table public.memberships enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_attendances enable row level security;

create policy "clubs_select_public" on public.clubs for select using (true);
create policy "clubs_write_operator" on public.clubs for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_operator = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_operator = true));

create policy "meetings_select_public" on public.meetings for select using (true);
create policy "meetings_write_operator" on public.meetings for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_operator = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_operator = true));

create policy "memberships_select_own" on public.memberships for select
  using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_operator = true));
create policy "memberships_update_own" on public.memberships for update
  using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_operator = true));
-- INSERT는 없음 — 멤버십은 apply_to_meeting()의 첫 참석 승격 트리거를 통해서만 생성된다(SECURITY DEFINER가 RLS 우회).

create policy "attendances_select_own" on public.meeting_attendances for select
  using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_operator = true));
create policy "attendances_write_operator" on public.meeting_attendances for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_operator = true));
-- INSERT/취소는 apply_to_meeting()/cancel_attendance() RPC로만 — 프론트가 아니라 서버에서 원자적으로 정원 검증(§C3 M1).

-- ============================================================
-- 내 근처 북클럽 — PostGIS ST_DWithin. clubs는 이미 공개 SELECT 정책이 있으므로
-- SECURITY INVOKER(기본값)로 두어도 안전하다.
-- ============================================================
create or replace function public.clubs_within(p_lat double precision, p_lng double precision, p_radius_m double precision)
returns setof public.clubs language sql stable as $$
  select c.* from public.clubs c
  where c.location is not null
    and ST_DWithin(c.location, ST_MakePoint(p_lng, p_lat)::geography, p_radius_m)
  order by ST_Distance(c.location, ST_MakePoint(p_lng, p_lat)::geography) asc;
$$;

grant execute on function public.clubs_within(double precision, double precision, double precision) to anon, authenticated;

-- ============================================================
-- 공개 집계 함수 — PII 없이 좌석/멤버 수만 노출 (비로그인 방문자도 호출 가능)
-- ============================================================
create or replace function public.get_meeting_seats(p_meeting_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'capacity', eff.capacity,
    'taken', eff.taken,
    'remaining', case when eff.capacity is null then null else greatest(eff.capacity - eff.taken, 0) end
  )
  from (
    select
      coalesce(m.capacity, c.capacity) as capacity,
      (select count(*) from public.meeting_attendances a
        where a.meeting_id = m.id and a.status in ('applied', 'pending', 'attended')) as taken
    from public.meetings m
    join public.clubs c on c.id = m.club_id
    where m.id = p_meeting_id
  ) eff;
$$;

revoke all on function public.get_meeting_seats(uuid) from public;
grant execute on function public.get_meeting_seats(uuid) to anon, authenticated;

create or replace function public.get_club_member_count(p_club_id uuid)
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int from public.memberships where club_id = p_club_id and status = 'active';
$$;

revoke all on function public.get_club_member_count(uuid) from public;
grant execute on function public.get_club_member_count(uuid) to anon, authenticated;

-- ============================================================
-- apply_to_meeting — 회차 신청. 정원/승인제를 서버(DB)에서 원자적으로 판정한다.
-- meetings 행을 잠근 뒤(FOR UPDATE) 현재 인원을 세므로 동시 신청에도 초과 입장이 없다.
-- ============================================================
create or replace function public.apply_to_meeting(p_meeting_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_club_id uuid;
  v_join_policy text;
  v_capacity int;
  v_starts_at timestamptz;
  v_status text;
  v_taken int;
  v_result_status text;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select m.club_id, m.starts_at, m.status, coalesce(m.capacity, c.capacity), c.join_policy
    into v_club_id, v_starts_at, v_status, v_capacity, v_join_policy
    from public.meetings m
    join public.clubs c on c.id = m.club_id
    where m.id = p_meeting_id
    for update of m;

  if v_club_id is null then
    raise exception 'meeting not found';
  end if;
  if v_status <> 'scheduled' then
    raise exception 'meeting is not open for applications';
  end if;
  if v_starts_at < now() then
    raise exception 'meeting already started';
  end if;

  if exists (
    select 1 from public.meeting_attendances
    where meeting_id = p_meeting_id and user_id = v_user_id
      and status in ('applied', 'pending', 'waitlist', 'attended')
  ) then
    raise exception 'already applied';
  end if;

  select count(*) into v_taken
    from public.meeting_attendances
    where meeting_id = p_meeting_id and status in ('applied', 'pending', 'attended');

  if v_capacity is not null and v_taken >= v_capacity then
    v_result_status := 'waitlist';
  elsif v_join_policy = 'approval' then
    v_result_status := 'pending';
  else
    v_result_status := 'applied';
  end if;

  insert into public.meeting_attendances (meeting_id, user_id, status)
  values (p_meeting_id, v_user_id, v_result_status)
  on conflict (meeting_id, user_id) do update set status = excluded.status;

  return v_result_status;
end;
$$;

revoke all on function public.apply_to_meeting(uuid) from public;
grant execute on function public.apply_to_meeting(uuid) to authenticated;

-- ============================================================
-- cancel_attendance — 원탭 나가기(신청 취소). 좌석이 비면 대기열 1순위를 자동 승격한다.
-- ============================================================
create or replace function public.cancel_attendance(p_meeting_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_prev_status text;
  v_promoted_user uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select status into v_prev_status
    from public.meeting_attendances
    where meeting_id = p_meeting_id and user_id = v_user_id
    for update;

  if v_prev_status is null then
    raise exception 'no attendance to cancel';
  end if;

  update public.meeting_attendances
    set status = 'canceled'
    where meeting_id = p_meeting_id and user_id = v_user_id;

  -- 취소한 사람이 실제 좌석(applied/pending)을 갖고 있었을 때만 대기열을 승격한다.
  if v_prev_status in ('applied', 'pending') then
    select user_id into v_promoted_user
      from public.meeting_attendances
      where meeting_id = p_meeting_id and status = 'waitlist'
      order by created_at asc
      limit 1
      for update skip locked;

    if v_promoted_user is not null then
      update public.meeting_attendances
        set status = 'applied'
        where meeting_id = p_meeting_id and user_id = v_promoted_user;
    end if;
  end if;
end;
$$;

revoke all on function public.cancel_attendance(uuid) from public;
grant execute on function public.cancel_attendance(uuid) to authenticated;

-- ============================================================
-- 트리거 — 첫 참석 완료(attended) 시 자동으로 클럽 멤버가 된다(여정③ 구조적 귀결).
-- ============================================================
create or replace function public.handle_attendance_to_membership()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_club_id uuid;
begin
  if new.status = 'attended' and (old.status is distinct from 'attended') then
    select club_id into v_club_id from public.meetings where id = new.meeting_id;
    if v_club_id is not null then
      insert into public.memberships (club_id, user_id, role, status)
      values (v_club_id, new.user_id, 'member', 'active')
      on conflict (club_id, user_id) do update set status = 'active'
        where public.memberships.status = 'left';
    end if;
  end if;
  return new;
end;
$$;

create trigger on_attendance_attended
  after update on public.meeting_attendances
  for each row execute procedure public.handle_attendance_to_membership();
