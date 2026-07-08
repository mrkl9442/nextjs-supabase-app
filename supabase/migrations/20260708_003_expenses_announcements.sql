-- ================================================================
-- TASK-024: expenses 테이블 + RLS
-- TASK-025: announcements 테이블 + RLS
-- ================================================================

-- ----------------------------------------------------------------
-- expenses (정산 항목)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  label      TEXT        NOT NULL,
  amount     INTEGER     NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 이벤트 주최자만 항목 추가/수정/삭제
CREATE POLICY "host_manage_expenses" ON expenses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = expenses.event_id
        AND events.host_id = auth.uid()
    )
  );

-- 이벤트 참여자(attending)는 조회 가능
CREATE POLICY "attendee_read_expenses" ON expenses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM attendances
      WHERE attendances.event_id = expenses.event_id
        AND attendances.user_id  = auth.uid()
        AND attendances.status   = 'attending'
    )
  );

-- ----------------------------------------------------------------
-- announcements (공지사항)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 이벤트 주최자만 공지 작성/수정/삭제
CREATE POLICY "host_manage_announcements" ON announcements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = announcements.event_id
        AND events.host_id = auth.uid()
    )
  );

-- 누구나 공지 조회 가능 (이벤트 상세 페이지는 비로그인 접근 허용)
CREATE POLICY "anyone_read_announcements" ON announcements
  FOR SELECT
  USING (true);

-- Realtime 활성화 (공지 등록 시 이벤트 상세 페이지에 즉시 반영)
ALTER TABLE announcements REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
