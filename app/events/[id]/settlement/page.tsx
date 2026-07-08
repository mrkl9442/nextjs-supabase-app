import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { SettlementForm } from "@/components/settlement-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SettlementPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const userId = claims.claims.sub;

  const { data: event } = await supabase
    .from("events")
    .select("id, title, host_id")
    .eq("id", id)
    .single();

  if (!event) notFound();

  const isHost = event.host_id === userId;

  // 주최자 또는 attending 상태인 경우만 접근 허용
  if (!isHost) {
    const { data: attendance } = await supabase
      .from("attendances")
      .select("id")
      .eq("event_id", id)
      .eq("user_id", userId)
      .eq("status", "attending")
      .maybeSingle();

    if (!attendance) redirect(`/events/${id}`);
  }

  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, label, amount")
    .eq("event_id", id)
    .order("created_at", { ascending: true });

  const { data: attendances } = await supabase
    .from("attendances")
    .select("id")
    .eq("event_id", id)
    .eq("status", "attending");

  const attendingCount = attendances?.length ?? 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-1 text-xl font-bold">정산</h1>
      <p className="mb-6 text-sm text-muted-foreground">{event.title}</p>

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">지출 항목</CardTitle>
        </CardHeader>
        <CardContent>
          <SettlementForm
            eventId={id}
            expenses={expenses ?? []}
            attendingCount={attendingCount}
            isHost={isHost}
          />
        </CardContent>
      </Card>
    </div>
  );
}
