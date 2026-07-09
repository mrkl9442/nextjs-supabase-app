"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, isAdmin } from "@/lib/admin/is-admin";

export async function deleteEventAction(eventId: string) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/auth/login");

  const role = await getUserRole(supabase, data.claims.sub);
  if (!isAdmin(role)) throw new Error("권한이 없습니다");

  // attendances·expenses·announcements·carpool_drivers/members는
  // events.id를 ON DELETE CASCADE로 참조하므로 별도 삭제 없이 자동 정리된다.
  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/events");
  revalidatePath("/dashboard");
}
