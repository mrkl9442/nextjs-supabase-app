-- Phase 5 (TASK-050): 관리자 RLS 정책 — 호스트 무관 전체 CRUD 허용

-- ============================================================
-- 1. profiles.is_suspended 컬럼 (계정 정지 운영 액션용)
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false;

-- ============================================================
-- 2. is_admin() 헬퍼 함수
-- ============================================================
-- SECURITY DEFINER로 정의해 profiles RLS와 무관하게 role을 조회한다.
-- (profiles_select_public이 이미 전체 공개 조회라 재귀 문제는 없지만,
-- 정책 작성 시 반복 서브쿼리를 피하고 의도를 명확히 하기 위한 표준 패턴이다.)
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = uid AND role = 'admin'
  );
$$;

-- ============================================================
-- 3. events: 관리자는 호스트 무관 수정/삭제 가능 (조회는 이미 전체 공개)
-- ============================================================
CREATE POLICY "events_update_admin"
  ON events FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "events_delete_admin"
  ON events FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================================
-- 4. profiles: 관리자는 타 사용자 프로필 수정 가능 (계정 정지 처리용)
-- ============================================================
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
