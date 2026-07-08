-- Phase 1 (TASK-013): profiles + events 테이블 생성 및 RLS

-- ============================================================
-- 1. profiles 테이블 (auth.users 보조 — 표시 이름·아바타)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    text        UNIQUE,
  full_name   text,
  avatar_url  text,
  website     text,
  bio         text,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 전체 공개 조회
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (true);

-- 본인 프로필만 생성
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 본인 프로필만 수정
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 신규 가입 시 profiles 행 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================
-- 2. events 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  event_date  timestamptz NOT NULL,
  location    text,
  description text,
  capacity    integer     CHECK (capacity > 0),
  fee         integer     DEFAULT 0 CHECK (fee >= 0),
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 전체 공개 조회 (공유 링크 비로그인 접근)
CREATE POLICY "events_select_public"
  ON events FOR SELECT
  USING (true);

-- 로그인 사용자만 생성
CREATE POLICY "events_insert_authenticated"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- 주최자만 수정
CREATE POLICY "events_update_host"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- 주최자만 삭제
CREATE POLICY "events_delete_host"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);
