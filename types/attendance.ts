export type AttendanceStatus = "attending" | "absent" | "undecided";

export interface Attendance {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  status: AttendanceStatus;
  responded_at: string;
}

export type AttendanceInsert = Omit<Attendance, "id">;

export type AttendanceUpdate = Partial<
  Pick<Attendance, "status" | "responded_at">
>;
