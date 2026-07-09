"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, isAdmin } from "@/lib/admin/is-admin";

export async function suspendUserAction(userId: string, suspend: boolean) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/auth/login");

  const role = await getUserRole(supabase, data.claims.sub);
  if (!isAdmin(role)) throw new Error("권한이 없습니다");

  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: suspend })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}
