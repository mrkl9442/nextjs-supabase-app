import type { Event } from "@/types";

export const DUMMY_EVENTS: Event[] = [
  {
    id: "evt-1",
    host_id: "user-1",
    title: "7월 수영 모임",
    event_date: "2026-07-05T10:00:00",
    location: "잠실 올림픽 수영장",
    description:
      "매월 첫째 주 토요일 수영 모임입니다. 준비물: 수영모, 수경 필수",
    capacity: 15,
    fee: 15000,
    cover_image_url: null,
    created_at: "2026-06-20T09:00:00",
  },
  {
    id: "evt-2",
    host_id: "user-1",
    title: "헬스장 번개 모임",
    event_date: "2026-07-10T19:00:00",
    location: "강남 피트니스 센터",
    description: "같이 운동하고 단백질 쉐이크 한 잔 해요!",
    capacity: 8,
    fee: 0,
    cover_image_url: null,
    created_at: "2026-06-22T14:00:00",
  },
  {
    id: "evt-3",
    host_id: "user-2",
    title: "친구들 보드게임 모임",
    event_date: "2026-07-12T14:00:00",
    location: "홍대 보드게임 카페",
    description: null,
    capacity: 6,
    fee: 12000,
    cover_image_url: null,
    created_at: "2026-06-25T11:00:00",
  },
];

export const DUMMY_EVENT: Event = DUMMY_EVENTS[0];
