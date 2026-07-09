"use server";

import { createClient } from "@/lib/supabase/server";
import { createEventSchema, type CreateEventInput } from "@/lib/schemas";
import { redirect } from "next/navigation";

export async function updateEventAction(
  eventId: string,
  input: CreateEventInput
) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/auth/login");

  const { data: existing } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (!existing || existing.host_id !== data.claims.sub) {
    throw new Error("권한이 없습니다");
  }

  const validated = createEventSchema.parse(input);

  const { error } = await supabase
    .from("events")
    .update({
      title: validated.title,
      event_date: new Date(validated.event_date).toISOString(),
      location: validated.location ?? null,
      description: validated.description ?? null,
      capacity: validated.capacity ?? null,
      fee: validated.fee ?? 0,
      cover_image_url: validated.cover_image_url ?? null,
    })
    .eq("id", eventId);

  if (error) throw new Error(error.message);

  redirect(`/events/${eventId}`);
}
