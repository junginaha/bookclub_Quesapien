-- Qusapience Supabase security advisor response
-- Alert: rls_disabled_in_public (project pgstyeddzbjoijmmnuuw)
-- Prepared: 2026-09-30 KST
--
-- PURPOSE
--   1) Identify the exact public table(s) with RLS disabled.
--   2) Inspect grants and policies before changing anything.
--   3) Verify the result after a table-specific fix.
--
-- SAFETY
--   All executable statements in this file are read-only.
--   Do not apply the commented remediation template until the table's intended
--   public/authenticated access has been compared with application code and
--   the matching migration. Enabling RLS without a required policy can break
--   production reads or writes.

-- A. Critical finding: public base tables with RLS disabled
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced,
  pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'p')
  AND c.relrowsecurity = false
ORDER BY c.relname;

-- B. Grants that can expose public-schema tables to API roles
SELECT
  table_schema,
  table_name,
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('PUBLIC', 'anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

-- C. Existing policies (compare the affected table with its migration)
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- D. Public-schema SECURITY DEFINER functions need separate review because
--    they can bypass caller privileges when their implementation allows it.
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  p.prosecdef AS security_definer
FROM pg_proc AS p
JOIN pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true
ORDER BY p.proname;

-- E. Table-specific remediation template (INTENTIONALLY COMMENTED OUT)
--
-- BEGIN;
-- ALTER TABLE public.REPLACE_WITH_VERIFIED_TABLE ENABLE ROW LEVEL SECURITY;
--
-- Choose grants and policies from the table's actual product contract.
-- Do not blanket-revoke public access from public-content tables.
-- For a verified service-only intake table, the matching pattern may be:
-- REVOKE ALL ON TABLE public.REPLACE_WITH_VERIFIED_TABLE
--   FROM PUBLIC, anon, authenticated;
-- GRANT ALL ON TABLE public.REPLACE_WITH_VERIFIED_TABLE TO service_role;
-- COMMIT;
--
-- Then rerun sections A-C and run:
--   node --env-file=.env.local scripts/rls-pentest.mjs
-- Finally smoke-test the affected live read/write flow.

-- Repository audit note:
-- The 29 application tables created by supabase/migrations/001-021 each have
-- an ENABLE ROW LEVEL SECURITY statement in source. If section A returns one
-- of those tables, the live database is probably behind or drifted from the
-- repository migration state. If it returns a different table, locate its
-- creator/consumer before defining policies or grants.
