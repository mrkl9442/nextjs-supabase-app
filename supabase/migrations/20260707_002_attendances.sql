-- Phase 1 (TASK-014): attendances 테이블 생성 및 RLS

-- attendance_status enum 타입
CREATE TYPE attendance_status AS ENUM ('attending', 'absent', 'undecided');

-- attendances 테이블
CREATE TABLE IF NOT EXISTS attendances (
  id           uuid              DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id     uuid              NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id      uuid              NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status       attendance_status NOT NULL,
  responded_at timestamptz       DEFAULT now() NOT NULL,
  UNIQUE (event_id, user_id)
);

ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

-- 전체 공개 조회
CREATE POLICY "attendances_select_public"
  ON attendances FOR SELECT
  USING (true);

-- 로그인 사용자만 본인 응답 생성
CREATE POLICY "attendances_insert_authenticated"
  ON attendances FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 본인 응답만 수정
CREATE POLICY "attendances_update_own"
  ON attendances FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 본인 응답만 삭제
CREATE POLICY "attendances_delete_own"
  ON attendances FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
