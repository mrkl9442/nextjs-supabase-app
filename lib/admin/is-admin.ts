import type { SupabaseClient } from "@supabase/supabase-js";

export function isAdmin(role: string | null | undefined): boolean {
  return role === "admin";
}

export async function getUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role ?? null;
}
