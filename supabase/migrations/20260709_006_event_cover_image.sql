-- Phase 5 (TASK-001): 이벤트 대표 이미지 업로드 지원

-- ============================================================
-- 1. events 테이블에 대표 이미지 URL 컬럼 추가
-- ============================================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_image_url text;

-- ============================================================
-- 2. event-images Storage 버킷 생성 (공개 읽기, 5MB, 이미지 전용)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 전체 공개 조회 (이벤트 공유 링크 비로그인 접근과 동일한 원칙)
CREATE POLICY "event_images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

-- 본인 폴더({auth.uid()}/...)에만 업로드 가능
CREATE POLICY "event_images_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 본인 폴더에만 수정 가능
CREATE POLICY "event_images_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'event-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 본인 폴더에만 삭제 가능
CREATE POLICY "event_images_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
