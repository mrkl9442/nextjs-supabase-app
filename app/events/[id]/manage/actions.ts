"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addAnnouncementAction(eventId: string, content: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  if (!content.trim()) return { error: "내용을 입력하세요" };

  const { data: event } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (!event || event.host_id !== claims.claims.sub) {
    return { error: "권한이 없습니다" };
  }

  const { error } = await supabase
    .from("announcements")
    .insert({ event_id: eventId, content: content.trim() });

  if (error) return { error: "저장 중 오류가 발생했습니다" };

  revalidatePath(`/events/${eventId}/manage`);
  revalidatePath(`/events/${eventId}`);
  return { error: null };
}
