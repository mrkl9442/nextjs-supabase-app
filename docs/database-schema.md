# Database Schema

모임 이벤트 관리 웹 MVP의 Supabase 데이터베이스 스키마입니다.
**이 문서는 설계 참조용이며, 실제 테이블 생성은 Phase 1~3에서 수행합니다.**

---

## 테이블 목록

| 테이블            | 설명             | 생성 Phase         |
| ----------------- | ---------------- | ------------------ |
| `events`          | 이벤트 기본 정보 | Phase 1 (TASK-013) |
| `attendances`     | 참여 응답        | Phase 1 (TASK-014) |
| `announcements`   | 공지사항         | Phase 2 (TASK-025) |
| `expenses`        | 정산 항목        | Phase 2 (TASK-024) |
| `carpool_drivers` | 카풀 드라이버    | Phase 3 (TASK-033) |
| `carpool_members` | 카풀 탑승자      | Phase 3 (TASK-033) |

---

## SQL DDL

### 1. events

```sql
CREATE TABLE events (
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
```

---

### 2. attendances

```sql
CREATE TYPE attendance_status AS ENUM ('attending', 'absent', 'undecided');

CREATE TABLE attendances (
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
```

---

### 3. announcements

```sql
CREATE TABLE announcements (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id   uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  content    text        NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 전체 공개 조회
CREATE POLICY "announcements_select_public"
  ON announcements FOR SELECT
  USING (true);

-- 이벤트 주최자만 공지 생성
CREATE POLICY "announcements_insert_host"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = (SELECT host_id FROM events WHERE id = event_id)
  );

-- 이벤트 주최자만 공지 수정
CREATE POLICY "announcements_update_host"
  ON announcements FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = (SELECT host_id FROM events WHERE id = event_id)
  );

-- 이벤트 주최자만 공지 삭제
CREATE POLICY "announcements_delete_host"
  ON announcements FOR DELETE
  TO authenticated
  USING (
    auth.uid() = (SELECT host_id FROM events WHERE id = event_id)
  );
```

---

### 4. expenses

```sql
CREATE TABLE expenses (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id   uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  label      text        NOT NULL,
  amount     integer     NOT NULL CHECK (amount >= 0),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 전체 공개 조회
CREATE POLICY "expenses_select_public"
  ON expenses FOR SELECT
  USING (true);

-- 이벤트 주최자만 지출 항목 생성
CREATE POLICY "expenses_insert_host"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = (SELECT host_id FROM events WHERE id = event_id)
  );

-- 이벤트 주최자만 수정
CREATE POLICY "expenses_update_host"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = (SELECT host_id FROM events WHERE id = event_id)
  );

-- 이벤트 주최자만 삭제
CREATE POLICY "expenses_delete_host"
  ON expenses FOR DELETE
  TO authenticated
  USING (
    auth.uid() = (SELECT host_id FROM events WHERE id = event_id)
  );
```

---

### 5. carpool_drivers

```sql
CREATE TABLE carpool_drivers (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id       uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  driver_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  departure      text        NOT NULL,
  max_passengers integer     NOT NULL CHECK (max_passengers >= 1),
  is_confirmed   boolean     DEFAULT false NOT NULL,
  UNIQUE (event_id, driver_id)
);

ALTER TABLE carpool_drivers ENABLE ROW LEVEL SECURITY;

-- 전체 공개 조회
CREATE POLICY "carpool_drivers_select_public"
  ON carpool_drivers FOR SELECT
  USING (true);

-- 참여 확정자(attending)만 드라이버 등록
CREATE POLICY "carpool_drivers_insert_attending"
  ON carpool_drivers FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = driver_id
    AND EXISTS (
      SELECT 1 FROM attendances
      WHERE event_id = carpool_drivers.event_id
        AND user_id = auth.uid()
        AND status = 'attending'
    )
  );

-- 드라이버 본인만 수정 (is_confirmed는 주최자가 별도 처리)
CREATE POLICY "carpool_drivers_update_own"
  ON carpool_drivers FOR UPDATE
  TO authenticated
  USING (auth.uid() = driver_id);

-- 드라이버 본인 또는 주최자만 삭제
CREATE POLICY "carpool_drivers_delete_own_or_host"
  ON carpool_drivers FOR DELETE
  TO authenticated
  USING (
    auth.uid() = driver_id
    OR auth.uid() = (SELECT host_id FROM events WHERE id = event_id)
  );
```

---

### 6. carpool_members

```sql
CREATE TABLE carpool_members (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id    uuid        NOT NULL REFERENCES carpool_drivers(id) ON DELETE CASCADE,
  passenger_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now() NOT NULL,
  UNIQUE (driver_id, passenger_id)
);

ALTER TABLE carpool_members ENABLE ROW LEVEL SECURITY;

-- 전체 공개 조회
CREATE POLICY "carpool_members_select_public"
  ON carpool_members FOR SELECT
  USING (true);

-- 본인이 직접 탑승 신청 (배정 미확정 상태만)
CREATE POLICY "carpool_members_insert_own"
  ON carpool_members FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = passenger_id
    AND NOT (SELECT is_confirmed FROM carpool_drivers WHERE id = driver_id)
  );

-- 본인 탑승 신청만 취소 (배정 미확정 상태만)
CREATE POLICY "carpool_members_delete_own"
  ON carpool_members FOR DELETE
  TO authenticated
  USING (
    auth.uid() = passenger_id
    AND NOT (SELECT is_confirmed FROM carpool_drivers WHERE id = driver_id)
  );
```

---

## 관계 다이어그램

```
auth.users
    │
    ├──(host_id)──→ events ←──(event_id)── attendances ←──(user_id)── auth.users
    │                  │
    │                  ├──(event_id)── announcements
    │                  ├──(event_id)── expenses
    │                  └──(event_id)── carpool_drivers ←──(driver_id)── auth.users
    │                                       │
    │                                       └──(driver_id)── carpool_members ←──(passenger_id)── auth.users
    │
    └──(driver_id)── carpool_drivers
```

---

## 실행 순서 (Phase별)

```sql
-- Phase 1: TASK-013
-- 1. events 테이블
-- 2. attendances 테이블 (attendance_status enum 포함)

-- Phase 2: TASK-024, TASK-025
-- 3. expenses 테이블
-- 4. announcements 테이블

-- Phase 3: TASK-033
-- 5. carpool_drivers 테이블
-- 6. carpool_members 테이블
```
