export interface CarpoolDriver {
  id: string;
  event_id: string;
  driver_id: string;
  driver_name: string;
  departure: string;
  max_passengers: number;
  is_confirmed: boolean;
}

export interface CarpoolMember {
  id: string;
  driver_id: string;
  passenger_id: string;
  passenger_name: string;
  created_at: string;
}

export type CarpoolDriverInsert = Omit<CarpoolDriver, "id">;

export type CarpoolMemberInsert = Omit<CarpoolMember, "id" | "created_at">;
