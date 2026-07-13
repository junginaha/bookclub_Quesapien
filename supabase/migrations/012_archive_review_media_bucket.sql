-- ============================================================
-- Migration 012: 아카이빙 후기 사진·영상 업로드용 Storage 버킷
-- ============================================================
-- ⚠ 이 저장소의 실행 환경은 라이브 Supabase 프로젝트에 대한 네트워크 접근이 없어
-- 이 마이그레이션은 적용되지 않았다. 운영자가 Supabase 대시보드 SQL 에디터에
-- 그대로 붙여넣어 실행해야 한다. `reviews` 버킷은 지금까지 마이그레이션 파일 없이
-- 대시보드에서 수동으로만 만들어졌을 가능성이 있어(코드 주석 "Bucket may not exist"),
-- 존재 여부와 무관하게 안전하게 재실행할 수 있도록 작성했다.

INSERT INTO storage.buckets (id, name, public)
VALUES ('reviews', 'reviews', true)
ON CONFLICT (id) DO NOTHING;

-- archive_reviews 테이블 자체가 로그인 없이 누구나 작성 가능하므로(003 마이그레이션),
-- 이 버킷도 동일하게 공개 읽기 + 누구나 업로드를 허용한다(사진/영상 후기 첨부용).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'reviews_bucket_public_read'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "reviews_bucket_public_read" ON storage.objects
        FOR SELECT USING (bucket_id = 'reviews');
    $policy$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'reviews_bucket_public_insert'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "reviews_bucket_public_insert" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'reviews');
    $policy$;
  END IF;
END $$;
