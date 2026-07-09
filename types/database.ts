import type { Event, EventInsert, EventUpdate } from "./event";
import type {
  Attendance,
  AttendanceInsert,
  AttendanceUpdate,
} from "./attendance";
import type {
  Announcement,
  AnnouncementInsert,
  AnnouncementUpdate,
} from "./announcement";
import type { Expense, ExpenseInsert, ExpenseUpdate } from "./expense";
import type {
  CarpoolDriver,
  CarpoolDriverInsert,
  CarpoolMember,
  CarpoolMemberInsert,
} from "./carpool";

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  bio: string | null;
  role: "user" | "admin";
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdate = Omit<
  Profile,
  "id" | "created_at" | "updated_at" | "role" | "is_suspended"
>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<ProfileUpdate>;
      };
      events: {
        Row: Event;
        Insert: EventInsert;
        Update: EventUpdate;
      };
      attendances: {
        Row: Attendance;
        Insert: AttendanceInsert;
        Update: AttendanceUpdate;
      };
      announcements: {
        Row: Announcement;
        Insert: AnnouncementInsert;
        Update: AnnouncementUpdate;
      };
      expenses: {
        Row: Expense;
        Insert: ExpenseInsert;
        Update: ExpenseUpdate;
      };
      carpool_drivers: {
        Row: CarpoolDriver;
        Insert: CarpoolDriverInsert;
        Update: Partial<CarpoolDriverInsert>;
      };
      carpool_members: {
        Row: CarpoolMember;
        Insert: CarpoolMemberInsert;
        Update: never;
      };
    };
  };
};
