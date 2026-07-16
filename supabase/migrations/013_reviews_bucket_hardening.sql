-- ============================================================
-- Migration 013: reviews 버킷 크기·타입 제한 통일
-- ============================================================
-- ⚠ 이 저장소의 실행 환경은 라이브 Supabase 프로젝트에 대한 네트워크 접근이 없어
-- 이 마이그레이션은 적용되지 않았다. 운영자가 Supabase 대시보드 SQL 에디터에
-- 그대로 붙여넣어 실행해야 한다.
--
-- 배경: 012 마이그레이션은 reviews 버킷을 크기/타입 제한 없이 생성했고,
-- 별도로 존재하는 /api/admin/run-migrations 라우트에는 이미지 전용 10MB 제한
-- 버전이 있었다(둘 다 라이브 DB에 적용된 적은 없음). 아카이빙 후기 폼은
-- 사진(서버 프록시 /api/upload)뿐 아니라 영상(브라우저→Storage 직접 업로드,
-- Vercel 서버리스 함수 바디 크기 제한을 피하기 위한 의도적 설계)도 지원하므로,
-- 인증 없는 누구나 write 가능한 이 버킷은 버킷 레벨(RLS가 아니라 Storage API
-- 자체) 제한이 없으면 임의 크기·타입 파일을 무제한으로 업로드할 수 있다.
-- 이 마이그레이션은 버킷을 images + video 둘 다 허용하는 50MB 상한으로 통일한다.

UPDATE storage.buckets
SET
  file_size_limit = 52428800, -- 50MB
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]
WHERE id = 'reviews';

-- 버킷이 아직 생성되지 않았을 가능성(012가 미적용인 경우)에 대비해 idempotent하게 재생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reviews', 'reviews', true, 52428800,
  ARRAY['image/jpeg','image/png','image/gif','image/webp','image/avif','video/mp4','video/webm','video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── archive_reviews UPDATE/DELETE RLS 누락 수정 ─────────────────
-- src/app/api/archive/review/[id]/route.ts의 PATCH/DELETE는 작성자 본인
-- (author_id = auth.uid())으로 scope된 업데이트/삭제를 시도하지만, 003
-- 마이그레이션에는 SELECT/INSERT 정책만 있고 UPDATE/DELETE 정책이 없어
-- RLS가 기본 거부(deny)로 막고 있었다 — "내 아카이브"의 수정/삭제 버튼이
-- 라이브 DB에서는 조용히 실패했을 것이다.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'archive_reviews' AND policyname = 'Owner can update own archive_reviews'
  ) THEN
    CREATE POLICY "Owner can update own archive_reviews"
      ON archive_reviews FOR UPDATE
      USING (author_id = auth.uid())
      WITH CHECK (author_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'archive_reviews' AND policyname = 'Owner can delete own archive_reviews'
  ) THEN
    CREATE POLICY "Owner can delete own archive_reviews"
      ON archive_reviews FOR DELETE
      USING (author_id = auth.uid());
  END IF;
END $$;
