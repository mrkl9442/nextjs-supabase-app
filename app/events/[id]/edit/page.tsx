import { notFound, redirect } from "next/navigation";
import { EditEventForm } from "@/components/edit-event-form";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();
  if (event.host_id !== claims.claims.sub) redirect(`/events/${id}`);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">이벤트 수정</h1>
      <EditEventForm event={event} />
    </div>
  );
}
