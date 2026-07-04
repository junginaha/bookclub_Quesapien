-- ============================================================
-- Quesapience 2.0 — M0. profiles 확장
-- 기존 컬럼(email,name,avatar_url,bio,session_count)은 유지하고
-- 스펙(§C3 M0)의 신규 컬럼을 추가한다. DROP 없음.
-- ============================================================

alter table public.profiles
  add column if not exists nickname text,
  add column if not exists phone text,                              -- E.164
  add column if not exists home_region geography(point, 4326),
  add column if not exists is_operator boolean not null default false,
  add column if not exists privacy_consented_at timestamptz,
  add column if not exists phone_consented_at timestamptz,
  add column if not exists deactivated_at timestamptz;

-- 기존 유저 백필: nickname이 비어있으면 기존 name으로 채운다.
update public.profiles set nickname = name where nickname is null;

alter table public.profiles alter column nickname set not null;

-- is_operator는 사용자 본인이 바꿀 수 없어야 한다(프론트 숨김만으로 보호 금지, §C0).
-- 컬럼 단위 권한으로 authenticated 롤의 UPDATE 자체를 차단하고, service_role만 변경 가능.
revoke update (is_operator) on public.profiles from authenticated;

-- 008에서 미뤄둔 events 조회 정책: 운영자만 조회 가능.
create policy "events_select_operator" on public.events
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_operator = true
    )
  );

-- ============================================================
-- 신규 가입 트리거 갱신 — 카카오 메타데이터 대응
-- 카카오/Google 등 provider마다 raw_user_meta_data 필드명이 다르므로
-- nickname 후보를 우선순위로 탐색한다.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_nickname text;
begin
  v_nickname := coalesce(
    new.raw_user_meta_data->>'nickname',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'user_name',
    split_part(coalesce(new.email, ''), '@', 1),
    '새 멤버'
  );

  insert into public.profiles (id, email, name, nickname, avatar_url)
  values (
    new.id,
    new.email,
    v_nickname,
    v_nickname,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ============================================================
-- 탈퇴 익명화 함수
-- auth.users 삭제는 코드(service client, auth.admin.deleteUser)에서 수행하고,
-- 그 전/후로 이 함수를 호출해 콘텐츠는 "탈퇴한 회원"으로 보존한다.
-- ============================================================
create or replace function public.anonymize_profile(p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
  set nickname = '탈퇴한 회원',
      name = '탈퇴한 회원',
      phone = null,
      avatar_url = null,
      home_region = null,
      deactivated_at = now()
  where id = p_user_id;
end;
$$;

-- Postgres grants EXECUTE to PUBLIC by default — revoke that, then grant only to service_role.
revoke all on function public.anonymize_profile(uuid) from public;
grant execute on function public.anonymize_profile(uuid) to service_role;
