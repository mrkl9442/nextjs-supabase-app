export interface Announcement {
  id: string;
  event_id: string;
  content: string;
  created_at: string;
}

export type AnnouncementInsert = Omit<Announcement, "id" | "created_at">;

export type AnnouncementUpdate = Partial<Pick<Announcement, "content">>;
