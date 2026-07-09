export interface Event {
  id: string;
  host_id: string;
  title: string;
  event_date: string;
  location: string | null;
  description: string | null;
  capacity: number | null;
  fee: number | null;
  cover_image_url: string | null;
  created_at: string;
}

export type EventInsert = Omit<Event, "id" | "created_at">;

export type EventUpdate = Partial<EventInsert>;
