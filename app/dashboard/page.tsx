import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const isJoined = tab === "joined";

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/auth/login");

  const userId = data.claims.sub;

  type EventRow = {
    id: string;
    title: string;
    event_date: string;
    location: string | null;
    fee: number | null;
    cover_image_url: string | null;
  };
  let events: EventRow[] = [];

  if (isJoined) {
    const { data: rows } = await supabase
      .from("attendances")
      .select("events(id, title, event_date, location, fee, cover_image_url)")
      .eq("user_id", userId)
      .eq("status", "attending");

    events = (rows ?? [])
      .map((r) => r.events as unknown as EventRow)
      .filter(Boolean);
  } else {
    const { data: rows } = await supabase
      .from("events")
      .select("id, title, event_date, location, fee, cover_image_url")
      .eq("host_id", userId)
      .order("event_date", { ascending: false });

    events = rows ?? [];
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 이벤트</h1>
        <Button asChild>
          <Link href="/events/new">이벤트 만들기</Link>
        </Button>
      </div>

      <div className="mb-4 flex gap-2">
        <Button variant={!isJoined ? "default" : "ghost"} size="sm" asChild>
          <Link href="/dashboard">주최한 이벤트</Link>
        </Button>
        <Button variant={isJoined ? "default" : "ghost"} size="sm" asChild>
          <Link href="/dashboard?tab=joined">참여한 이벤트</Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {isJoined ? "참여한 이벤트가 없습니다" : "주최한 이벤트가 없습니다"}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card className="flex cursor-pointer overflow-hidden transition-colors hover:bg-muted/50">
                {event.cover_image_url && (
                  <div className="relative w-32 shrink-0">
                    <Image
                      src={event.cover_image_url}
                      alt={event.title}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base">{event.title}</CardTitle>
                      <Badge variant="secondary">
                        {isJoined ? "참여" : "주최"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>
                      📅 {new Date(event.event_date).toLocaleString("ko-KR")}
                    </p>
                    {event.location && <p>📍 {event.location}</p>}
                    {event.fee != null && event.fee > 0 && (
                      <p>💰 {event.fee.toLocaleString()}원</p>
                    )}
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
