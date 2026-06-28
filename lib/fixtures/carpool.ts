import type { CarpoolDriver, CarpoolMember } from "@/types";

export const DUMMY_DRIVERS: CarpoolDriver[] = [
  {
    id: "drv-1",
    event_id: "evt-1",
    driver_id: "user-2",
    driver_name: "김민지",
    departure: "강남역 2번 출구",
    max_passengers: 3,
    is_confirmed: false,
  },
  {
    id: "drv-2",
    event_id: "evt-1",
    driver_id: "user-3",
    driver_name: "이준혁",
    departure: "건대입구역 1번 출구",
    max_passengers: 3,
    is_confirmed: false,
  },
];

export const DUMMY_CARPOOL_MEMBERS: CarpoolMember[] = [
  {
    id: "cm-1",
    driver_id: "drv-1",
    passenger_id: "user-4",
    passenger_name: "박수아",
    created_at: "2026-06-24T10:00:00",
  },
  {
    id: "cm-2",
    driver_id: "drv-1",
    passenger_id: "user-5",
    passenger_name: "최도현",
    created_at: "2026-06-24T11:00:00",
  },
  {
    id: "cm-3",
    driver_id: "drv-2",
    passenger_id: "user-9",
    passenger_name: "윤서진",
    created_at: "2026-06-24T12:00:00",
  },
  {
    id: "cm-4",
    driver_id: "drv-2",
    passenger_id: "user-10",
    passenger_name: "강태양",
    created_at: "2026-06-24T13:00:00",
  },
];
