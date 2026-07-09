-- Phase 5 (TASK-049): 관리자 권한 체계 — profiles.role 컬럼 도입

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- ============================================================
-- 최초 관리자 지정 방법 (수동 SQL 승격)
-- ============================================================
-- 이 프로젝트 규모(5~15명 소규모 모임 앱)에서는 회원가입 시점에
-- 자동으로 관리자를 지정하는 절차를 두지 않는다. 최초 관리자는
-- Supabase 대시보드 SQL Editor에서 아래 쿼리를 직접 실행해 수동으로
-- 승격한다.
--
--   UPDATE profiles SET role = 'admin' WHERE id = '<대상 사용자 UUID>';
--
-- 대상 사용자의 UUID는 Authentication > Users 목록에서 확인한다.
