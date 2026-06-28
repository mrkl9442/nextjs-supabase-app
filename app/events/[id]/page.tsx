import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DUMMY_EVENT,
  DUMMY_ATTENDANCES,
  DUMMY_ANNOUNCEMENTS,
} from "@/lib/fixtures";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = { ...DUMMY_EVENT, id };

  const attending = DUMMY_ATTENDANCES.filter((a) => a.status === "attending");
  const absent = DUMMY_ATTENDANCES.filter((a) => a.status === "absent");
  const undecided = DUMMY_ATTENDANCES.filter((a) => a.status === "undecided");
  const latestAnnouncement =
    DUMMY_ANNOUNCEMENTS[DUMMY_ANNOUNCEMENTS.length - 1];

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {latestAnnouncement && (
        <Card className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="py-3 text-sm">
            📢 {latestAnnouncement.content}
          </CardContent>
        </Card>
      )}

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
          {event.fee !== null && event.fee > 0 && (
            <p>💰 참여비 {event.fee.toLocaleString()}원</p>
          )}
          {event.capacity && <p>👥 정원 {event.capacity}명</p>}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">참여 응답</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
            >
              ✅ 참여
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-red-400 text-red-500 hover:bg-red-50"
            >
              ❌ 불참
            </Button>
            <Button variant="outline" className="flex-1">
              🤔 미정
            </Button>
          </div>

          <Separator />

          <div className="flex justify-around text-center text-sm">
            <div>
              <p className="text-lg font-bold text-green-600">
                {attending.length}
              </p>
              <p className="text-muted-foreground">참여</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-500">{absent.length}</p>
              <p className="text-muted-foreground">불참</p>
            </div>
            <div>
              <p className="text-lg font-bold text-yellow-500">
                {undecided.length}
              </p>
              <p className="text-muted-foreground">미정</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {attending.map((a) => (
              <Badge key={a.id} variant="secondary">
                {a.user_name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        이벤트 ID: {id}
      </p>
    </div>
  );
}
