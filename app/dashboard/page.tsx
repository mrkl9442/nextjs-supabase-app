import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_EVENTS } from "@/lib/fixtures";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 이벤트</h1>
        <Button asChild>
          <Link href="/events/new">이벤트 만들기</Link>
        </Button>
      </div>

      <div className="mb-4 flex gap-2">
        <Button variant="default" size="sm">
          주최한 이벤트
        </Button>
        <Button variant="ghost" size="sm">
          참여한 이벤트
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {DUMMY_EVENTS.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`}>
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  <Badge variant="secondary">주최</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>📅 {new Date(event.event_date).toLocaleString("ko-KR")}</p>
                {event.location && <p>📍 {event.location}</p>}
                {event.fee !== null && event.fee > 0 && (
                  <p>💰 {event.fee.toLocaleString()}원</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
