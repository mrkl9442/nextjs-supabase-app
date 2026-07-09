import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { CopyLinkButton } from "@/components/copy-link-button";
import { AnnouncementSection } from "@/components/announcement-section";
import { NudgeMessageSection } from "@/components/nudge-message-section";
import { headers } from "next/headers";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventManagePage({ params }: Props) {
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

  const { data: attendancesRaw } = await supabase
    .from("attendances")
    .select("id, user_id, status")
    .eq("event_id", id);

  // user_id 목록으로 profiles 별도 조회
  const userIds = (attendancesRaw ?? []).map((a) => a.user_id);
  const { data: profilesData } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", userIds)
    : { data: [] };
  const profileMap = new Map((profilesData ?? []).map((p) => [p.id, p]));

  const attendances = (attendancesRaw ?? []).map((a) => ({
    ...a,
    profile: profileMap.get(a.user_id) ?? null,
  }));

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, content, created_at")
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  const attending = attendances?.filter((a) => a.status === "attending") ?? [];
  const absent = attendances?.filter((a) => a.status === "absent") ?? [];
  const undecided = attendances?.filter((a) => a.status === "undecided") ?? [];
  const totalResponded = attendances?.length ?? 0;
  const notRespondedCount = Math.max((event.capacity ?? 0) - totalResponded, 0);

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const eventUrl = `${protocol}://${host}/events/${id}`;

  type AttendanceRow = (typeof attendances)[number];
  const getName = (a: AttendanceRow) =>
    a.profile?.full_name ?? a.profile?.username ?? "참여자";

  // 미응답자: 정원이 있으면 미응답 수만큼 더미, 없으면 응답은 했지만 불참/미정인 사람들
  const noResponseList = Array.from({ length: notRespondedCount }, (_, i) => ({
    name: `미응답자 ${i + 1}`,
  }));

  const eventDateLabel = new Date(event.event_date).toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const announcementList = (announcements ?? []).map((a) => ({
    id: a.id,
    content: a.content,
    createdAt: new Date(a.created_at).toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-1 text-xl font-bold">이벤트 관리</h1>
      <p className="mb-6 text-sm text-muted-foreground">{event.title}</p>

      <div className="mb-4 grid grid-cols-4 gap-2 text-center">
        <Card>
          <CardContent className="py-3">
            <p className="text-xl font-bold text-green-600">
              {attending.length}
            </p>
            <p className="text-xs text-muted-foreground">참여</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xl font-bold text-red-500">{absent.length}</p>
            <p className="text-xs text-muted-foreground">불참</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xl font-bold text-yellow-500">
              {undecided.length}
            </p>
            <p className="text-xs text-muted-foreground">미정</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xl font-bold text-gray-400">
              {notRespondedCount}
            </p>
            <p className="text-xs text-muted-foreground">미응답</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <CopyLinkButton url={eventUrl} />
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" asChild>
            <Link href={`/events/${id}/settlement`}>💰 정산 관리</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/events/${id}/carpool`}>🚗 카풀 배정</Link>
          </Button>
          <Button variant="outline" asChild className="col-span-2">
            <Link href={`/events/${id}/edit`}>✏️ 이벤트 정보 수정</Link>
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col gap-4">
        <AnnouncementSection
          eventId={id}
          isHost={true}
          announcements={announcementList}
        />

        <NudgeMessageSection
          eventTitle={event.title}
          eventDate={eventDateLabel}
          noResponse={noResponseList}
        />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">참여 확정자</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1">
            {attending.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                아직 참여 확정자가 없습니다
              </p>
            ) : (
              attending.map((a) => (
                <Badge key={a.id} variant="secondary">
                  {getName(a)}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
