import type { Expense } from "@/types";

export const DUMMY_EXPENSES: Expense[] = [
  {
    id: "exp-1",
    event_id: "evt-1",
    label: "수영장 입장료",
    amount: 75000,
    created_at: "2026-07-05T12:00:00",
  },
  {
    id: "exp-2",
    event_id: "evt-1",
    label: "점심 식사 (삼겹살)",
    amount: 48000,
    created_at: "2026-07-05T13:30:00",
  },
  {
    id: "exp-3",
    event_id: "evt-1",
    label: "음료 및 간식",
    amount: 22000,
    created_at: "2026-07-05T14:00:00",
  },
];
