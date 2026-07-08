"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AttendanceStatus } from "@/types";

export async function respondToEventAction(
  eventId: string,
  status: AttendanceStatus
) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/auth/login");

  const userId = data.claims.sub;

  // 정원 초과 체크 (attending 변경 시)
  if (status === "attending") {
    const { data: event } = await supabase
      .from("events")
      .select("capacity")
      .eq("id", eventId)
      .single();

    if (event?.capacity) {
      const { count } = await supabase
        .from("attendances")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("status", "attending")
        .neq("user_id", userId);

      if ((count ?? 0) >= event.capacity) {
        throw new Error("정원이 초과되었습니다");
      }
    }
  }

  const { error } = await supabase.from("attendances").upsert(
    {
      event_id: eventId,
      user_id: userId,
      status,
      responded_at: new Date().toISOString(),
    },
    { onConflict: "event_id,user_id" }
  );

  if (error) throw new Error(error.message);

  revalidatePath(`/events/${eventId}`);
}
