-- ============================================================
-- Migration 022: lock down giants_conversations
-- Security response: Supabase rls_disabled_in_public
-- Prepared 2026-09-30 KST
-- ============================================================
--
-- This table was created directly in the live database in 2026-06 and had
-- no source-controlled migration. It stores AI conversation message JSON and
-- anonymous session keys, so direct Data API access is not part of the product
-- contract.
--
-- Application access is now mediated by /api/giants/conversation, which:
--   1) identifies an authenticated caller from Supabase Auth cookies,
--   2) uses the server-only service role for the database operation,
--   3) constrains reads/updates to user_id or anonymous session_key.
--
-- This migration is idempotent and does not delete or rewrite conversation data.

DO $$
BEGIN
  IF to_regclass('public.giants_conversations') IS NULL THEN
    RAISE NOTICE 'public.giants_conversations does not exist; nothing to secure';
    RETURN;
  END IF;

  ALTER TABLE public.giants_conversations ENABLE ROW LEVEL SECURITY;

  -- Defense in depth: even if a permissive policy exists from a manual setup,
  -- the public Data API roles do not receive table privileges.
  REVOKE ALL PRIVILEGES ON TABLE public.giants_conversations
    FROM PUBLIC, anon, authenticated;

  -- The server route is the sole supported data path.
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.giants_conversations
    TO service_role;
END
$$;

-- Verification after applying:
-- 1) Security Advisor should no longer report this table as
--    rls_disabled_in_public.
-- 2) The following should return relrowsecurity = true when the table exists.
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'giants_conversations';
