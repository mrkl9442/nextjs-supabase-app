import type { Announcement } from "@/types";

export const DUMMY_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    event_id: "evt-1",
    content: "준비물: 수영모, 수경 필수입니다. 수영복은 개인 지참해주세요.",
    created_at: "2026-06-25T10:00:00",
  },
  {
    id: "ann-2",
    event_id: "evt-1",
    content: "입장료 15,000원은 현장에서 걷겠습니다. 잔돈 준비 부탁드립니다.",
    created_at: "2026-06-27T09:00:00",
  },
  {
    id: "ann-3",
    event_id: "evt-1",
    content: "오전 9시 50분까지 수영장 정문 앞 집합해주세요!",
    created_at: "2026-07-04T20:00:00",
  },
];
