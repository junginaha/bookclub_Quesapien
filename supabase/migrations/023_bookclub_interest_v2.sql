-- 023: "읽고 싶어요" 신청서 확장 — 답변 받을 방법·남기실 말·동의 시각 저장.
-- 021(bookclub_waitlist, join_bookclub_waitlist)을 전제로 하며, 전부 재실행 안전(idempotent).
BEGIN;

ALTER TABLE public.bookclub_waitlist ADD COLUMN IF NOT EXISTS contact_method TEXT;
ALTER TABLE public.bookclub_waitlist ADD COLUMN IF NOT EXISTS memo TEXT;
ALTER TABLE public.bookclub_waitlist ADD COLUMN IF NOT EXISTS consented_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookclub_waitlist_contact_method_chk'
  ) THEN
    ALTER TABLE public.bookclub_waitlist
      ADD CONSTRAINT bookclub_waitlist_contact_method_chk
      CHECK (contact_method IS NULL OR contact_method IN ('sms', 'kakao', 'call'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookclub_waitlist_memo_len_chk'
  ) THEN
    ALTER TABLE public.bookclub_waitlist
      ADD CONSTRAINT bookclub_waitlist_memo_len_chk
      CHECK (memo IS NULL OR char_length(memo) <= 500);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.join_bookclub_interest(
  p_club_slug TEXT,
  p_name      TEXT,
  p_phone     TEXT,
  p_method    TEXT,
  p_memo      TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_phone TEXT;
  v_method TEXT;
  v_memo TEXT;
BEGIN
  v_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_method := coalesce(nullif(btrim(coalesce(p_method, '')), ''), 'sms');
  v_memo := nullif(btrim(coalesce(p_memo, '')), '');

  IF p_club_slug IS NULL OR btrim(p_club_slug) = ''
     OR p_name IS NULL OR btrim(p_name) = '' OR char_length(btrim(p_name)) > 80
     OR v_phone = '' OR char_length(v_phone) < 9 OR char_length(v_phone) > 15
     OR v_method NOT IN ('sms', 'kakao', 'call')
     OR (v_memo IS NOT NULL AND char_length(v_memo) > 500) THEN
    RAISE EXCEPTION USING MESSAGE = 'invalid_input', ERRCODE = 'P0001';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.bookclub_waitlist
    WHERE COALESCE(club_slug, '') = p_club_slug AND phone = v_phone
  ) THEN
    -- 다시 신청하면 연락 방법·남기실 말만 최신으로 갱신
    UPDATE public.bookclub_waitlist
      SET contact_method = v_method,
          memo = COALESCE(v_memo, memo),
          consented_at = now()
      WHERE COALESCE(club_slug, '') = p_club_slug AND phone = v_phone;
    RETURN jsonb_build_object('kind', 'duplicate');
  END IF;

  INSERT INTO public.bookclub_waitlist (club_slug, name, phone, contact_method, memo, consented_at)
  VALUES (p_club_slug, btrim(p_name), v_phone, v_method, v_memo, now());

  RETURN jsonb_build_object('kind', 'joined');
END;
$function$;

REVOKE ALL ON FUNCTION public.join_bookclub_interest(TEXT, TEXT, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.join_bookclub_interest(TEXT, TEXT, TEXT, TEXT, TEXT)
  TO service_role;

COMMIT;
