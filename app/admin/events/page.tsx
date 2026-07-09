import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import { deleteEventAction } from "./actions";
import { DeleteEventButton } from "@/components/admin/delete-event-button";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminEventsPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const supabase = await createClient();

  const { data: eventsRaw } = await supabase
    .from("events")
    .select("id, title, host_id, event_date, location")
    .order("event_date", { ascending: false });

  const hostIds = [...new Set((eventsRaw ?? []).map((e) => e.host_id))];
  const { data: hostProfiles } = hostIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", hostIds)
    : { data: [] };
  const hostMap = new Map((hostProfiles ?? []).map((p) => [p.id, p]));

  const events = (eventsRaw ?? []).map((event) => {
    const host = hostMap.get(event.host_id);
    return {
      ...event,
      host_name: host?.full_name ?? host?.username ?? "알 수 없음",
    };
  });

  const keyword = q?.trim().toLowerCase() ?? "";
  const filteredEvents = keyword
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(keyword) ||
          e.host_name.toLowerCase().includes(keyword)
      )
    : events;

  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">이벤트 관리</h1>

      <form className="flex gap-2">
        <Input
          name="q"
          placeholder="제목 또는 주최자 검색"
          defaultValue={q ?? ""}
        />
        <Button type="submit" variant="outline">
          검색
        </Button>
      </form>

      {filteredEvents.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          검색 결과가 없습니다
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredEvents.map((event) => {
            const isPast = new Date(event.event_date) < now;
            return (
              <Card key={event.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{event.title}</p>
                      <Badge variant={isPast ? "outline" : "secondary"}>
                        {isPast ? "종료" : "진행중"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      주최자 {event.host_name} · 📅{" "}
                      {new Date(event.event_date).toLocaleString("ko-KR")}
                      {event.location && <> · 📍 {event.location}</>}
                    </p>
                  </div>
                  <DeleteEventButton
                    eventTitle={event.title}
                    action={deleteEventAction.bind(null, event.id)}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
