-- Qusapience Supabase security advisor response
-- Project: pgstyeddzbjoijmmnuuw
-- Verified: 2026-09-30 KST
--
-- CONFIRMED LIVE FINDING
--   Supabase Security Advisor still reports exactly one rls_disabled_in_public:
--     public.spatial_ref_sys
--   This is the PostGIS coordinate-reference catalog (about 8,500 rows), not an
--   application customer-data table.
--
--   postgis version: 3.3.7
--   extension schema: public
--   extension relocatable: false
--   table owner: supabase_admin
--
-- IMPORTANT
--   Do NOT blindly enable RLS from an ordinary postgres session. The extension
--   owns this table and the live application uses PostGIS geography/distance
--   functions. Supabase's own Advisor warns that enabling RLS without the
--   required policies can block access.
--
-- PREFERRED PERMANENT FIX
--   Move PostGIS out of the exposed public schema into extensions.
--   Supabase documents that PostGIS >= 2.3 is not normally relocatable. For an
--   existing project, use a backup + dependency-aware migration, or ask
--   Supabase Support to relocate the extension. The repository's clean-install
--   migrations now create PostGIS in extensions and schema-qualify geo types/functions.
--
-- ============================================================
-- 1. READ-ONLY VERIFICATION
-- ============================================================

select
  e.extname,
  e.extversion,
  n.nspname as extension_schema,
  e.extrelocatable
from pg_extension e
join pg_namespace n on n.oid = e.extnamespace
where e.extname = 'postgis';

select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  pg_get_userbyid(c.relowner) as owner,
  c.relacl::text as acl
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'spatial_ref_sys';

select
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'spatial_ref_sys'
  and grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
order by grantee, privilege_type;

-- ============================================================
-- 2. INTERIM RLS OPTION — SUPPORT / OWNER-LEVEL EXECUTION ONLY
-- ============================================================
-- Use only if Supabase Support advises keeping PostGIS in public temporarily.
-- Preserve read access required by PostGIS, block all client writes.
--
-- alter table public.spatial_ref_sys enable row level security;
--
-- drop policy if exists "spatial_ref_sys_read_only" on public.spatial_ref_sys;
-- create policy "spatial_ref_sys_read_only"
--   on public.spatial_ref_sys
--   for select
--   to anon, authenticated
--   using (true);
--
-- revoke insert, update, delete, truncate, references, trigger
--   on table public.spatial_ref_sys
--   from anon, authenticated;
--
-- This SQL is intentionally commented because the live table is owned by
-- supabase_admin. The ordinary postgres role in this project cannot change its
-- ACL/RLS reliably, and running this without owner/support privileges is not a
-- valid production remediation.

-- ============================================================
-- 3. POST-FIX VERIFICATION
-- ============================================================
-- Expected permanent state:
--   A) PostGIS schema = extensions
--   B) public.spatial_ref_sys no longer exists
--   C) Security Advisor no longer reports rls_disabled_in_public
--
-- Functional smoke test used before/after:
-- select *
-- from public.nearby_book_clubs(37.5665, 126.9780, 30.0)
-- limit 3;
--
-- Repository linkage is confirmed by:
--   supabase/.temp/project-ref
--   supabase/.temp/linked-project.json
-- both pointing to pgstyeddzbjoijmmnuuw / Qusapience.
