import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { AttendanceSection } from "@/components/attendance-section";
import { AnnouncementSection } from "@/components/announcement-section";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  const [
    { data: attendancesRaw },
    { data: announcementsRaw },
    { data: claims },
  ] = await Promise.all([
    supabase
      .from("attendances")
      .select("id, user_id, status") // profiles 조인 제거 (FK 관계 없음)
      .eq("event_id", id),
    supabase
      .from("announcements")
      .select("id, content, created_at")
      .eq("event_id", id)
      .order("created_at", { ascending: false }),
    supabase.auth.getClaims(),
  ]);
  const userId = claims?.claims?.sub ?? null;

  // attendances의 user_id 목록으로 profiles 별도 조회
  const userIds = (attendancesRaw ?? []).map((a) => a.user_id);
  const { data: profilesRaw } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", userIds)
    : { data: [] };
  const profileMap = new Map((profilesRaw ?? []).map((p) => [p.id, p]));

  type AttendanceRow = {
    id: string;
    user_id: string;
    status: string;
    profiles: { full_name: string | null; username: string | null } | null;
  };
  const initialAttendances: AttendanceRow[] = (attendancesRaw ?? []).map(
    (a) => ({
      id: a.id,
      user_id: a.user_id,
      status: a.status,
      profiles: profileMap.get(a.user_id) ?? null,
    })
  );

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>📅 {new Date(event.event_date).toLocaleString("ko-KR")}</p>
          {event.location && <p>📍 {event.location}</p>}
          {event.description && (
            <p className="text-muted-foreground">{event.description}</p>
          )}
          {event.fee != null && event.fee > 0 && (
            <p>💰 참여비 {event.fee.toLocaleString()}원</p>
          )}
          {event.capacity && <p>👥 정원 {event.capacity}명</p>}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">참여 응답</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceSection
            eventId={id}
            userId={userId}
            initialAttendances={initialAttendances}
          />
        </CardContent>
      </Card>

      <AnnouncementSection
        isHost={false}
        announcements={(announcementsRaw ?? []).map((a) => ({
          id: a.id,
          content: a.content,
          createdAt: new Date(a.created_at).toLocaleString("ko-KR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }))}
      />
    </div>
  );
}
