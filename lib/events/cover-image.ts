import type { createClient } from "@/lib/supabase/client";

type SupabaseBrowserClient = ReturnType<typeof createClient>;

export async function uploadCoverImage(
  supabase: SupabaseBrowserClient,
  userId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("event-images")
    .upload(path, file);
  if (error) throw error;

  return supabase.storage.from("event-images").getPublicUrl(path).data
    .publicUrl;
}

export async function deleteCoverImage(
  supabase: SupabaseBrowserClient,
  url: string
): Promise<void> {
  const marker = "/event-images/";
  const idx = url.indexOf(marker);
  if (idx === -1) return;

  const path = url.slice(idx + marker.length);
  await supabase.storage.from("event-images").remove([path]);
}
