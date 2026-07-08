-- ================================================================
-- TASK-033: carpool_drivers · carpool_members 테이블 + RLS
-- ================================================================

-- ----------------------------------------------------------------
-- carpool_drivers (드라이버 등록)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carpool_drivers (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  driver_id      UUID        NOT NULL REFERENCES auth.users(id),
  departure      TEXT        NOT NULL,
  max_passengers INTEGER     NOT NULL CHECK (max_passengers > 0),
  is_confirmed   BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, driver_id)
);

ALTER TABLE carpool_drivers ENABLE ROW LEVEL SECURITY;

-- 누구나 조회 가능
CREATE POLICY "anyone_read_carpool_drivers" ON carpool_drivers
  FOR SELECT USING (true);

-- 본인 id로만 등록 (참여 확정 여부는 Server Action에서 검증)
CREATE POLICY "self_insert_driver" ON carpool_drivers
  FOR INSERT WITH CHECK (driver_id = auth.uid());

-- 본인 또는 이벤트 주최자만 수정 가능
CREATE POLICY "driver_or_host_update" ON carpool_drivers
  FOR UPDATE USING (
    driver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id
        AND events.host_id = auth.uid()
    )
  );

-- 본인만 삭제 (미확정 상태만)
CREATE POLICY "driver_delete_own" ON carpool_drivers
  FOR DELETE USING (driver_id = auth.uid() AND is_confirmed = false);

-- ----------------------------------------------------------------
-- carpool_members (탑승 신청)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carpool_members (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id    UUID        NOT NULL REFERENCES carpool_drivers(id) ON DELETE CASCADE,
  passenger_id UUID        NOT NULL REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(driver_id, passenger_id)
);

ALTER TABLE carpool_members ENABLE ROW LEVEL SECURITY;

-- 누구나 조회 가능
CREATE POLICY "anyone_read_carpool_members" ON carpool_members
  FOR SELECT USING (true);

-- 본인 id로만 신청 (좌석 여유·확정 여부는 Server Action에서 검증)
CREATE POLICY "self_insert_member" ON carpool_members
  FOR INSERT WITH CHECK (passenger_id = auth.uid());

-- 본인만 취소 가능
CREATE POLICY "passenger_delete_own" ON carpool_members
  FOR DELETE USING (passenger_id = auth.uid());

-- Realtime 활성화
ALTER TABLE carpool_drivers REPLICA IDENTITY FULL;
ALTER TABLE carpool_members REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE carpool_drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE carpool_members;
