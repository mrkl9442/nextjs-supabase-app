-- TASK-fix: attendances Realtime 활성화
-- UPDATE 이벤트에서 old/new 데이터 전달을 위해 REPLICA IDENTITY FULL 필요
ALTER TABLE attendances REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE attendances;
