"use server";

import { createClient } from "@/lib/supabase/server";
import { createEventSchema, type CreateEventInput } from "@/lib/schemas";
import { redirect } from "next/navigation";

export async function createEventAction(input: CreateEventInput) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/auth/login");

  const validated = createEventSchema.parse(input);

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      host_id: data.claims.sub,
      title: validated.title,
      event_date: new Date(validated.event_date).toISOString(),
      location: validated.location ?? null,
      description: validated.description ?? null,
      capacity: validated.capacity ?? null,
      fee: validated.fee ?? 0,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  redirect(`/events/${event.id}`);
}
