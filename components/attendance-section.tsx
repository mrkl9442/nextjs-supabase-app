"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { respondToEventAction } from "@/app/events/[id]/actions";
import type { AttendanceStatus } from "@/types";

type AttendanceRow = {
  id: string;
  user_id: string;
  status: string;
  profiles: { full_name: string | null; username: string | null } | null;
};

interface Props {
  eventId: string;
  userId: string | null;
  initialAttendances: AttendanceRow[];
}

export function AttendanceSection({
  eventId,
  userId,
  initialAttendances,
}: Props) {
  const [attendances, setAttendances] =
    useState<AttendanceRow[]>(initialAttendances);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const supabase = useRef(createClient()).current;

  const myAttendance = attendances.find((a) => a.user_id === userId);
  const currentStatus = (myAttendance?.status as AttendanceStatus) ?? null;

  const fetchAttendances = async () => {
    const { data: rawData } = await supabase
      .from("attendances")
      .select("id, user_id, status") // profiles 조인 제거 (FK 관계 없음)
      .eq("event_id", eventId);

    if (!rawData) return;

    // user_id 목록으로 profiles 별도 조회
    const userIds = rawData.map((a) => a.user_id);
    const { data: profilesData } = userIds.length
      ? await supabase
          .from("profiles")
          .select("id, full_name, username")
          .in("id", userIds)
      : { data: [] };
    const profileMap = new Map((profilesData ?? []).map((p) => [p.id, p]));

    setAttendances(
      rawData.map((a) => ({
        id: a.id,
        user_id: a.user_id,
        status: a.status,
        profiles: profileMap.get(a.user_id) ?? null,
      }))
    );
  };

  // Realtime 구독 — 다른 사용자 응답 시 즉시 반영
  useEffect(() => {
    const channel = supabase
      .channel(`attendances:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendances",
          filter: `event_id=eq.${eventId}`,
        },
        () => fetchAttendances()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const respond = (newStatus: AttendanceStatus) => {
    startTransition(async () => {
      setError(null);
      try {
        await respondToEventAction(eventId, newStatus);
        // Server Action 완료 후 Supabase 클라이언트로 직접 재조회 → 카운트 즉시 반영
        await fetchAttendances();
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다");
      }
    });
  };

  const attending = attendances.filter((a) => a.status === "attending");
  const absent = attendances.filter((a) => a.status === "absent");
  const undecided = attendances.filter((a) => a.status === "undecided");

  const getName = (a: AttendanceRow) =>
    a.profiles?.full_name ?? a.profiles?.username ?? "참여자";

  return (
    <div className="flex flex-col gap-3">
      {userId ? (
        <div className="flex gap-2">
          <Button
            variant={currentStatus === "attending" ? "default" : "outline"}
            className={`flex-1 ${
              currentStatus === "attending"
                ? "bg-green-500 hover:bg-green-600"
                : "border-green-500 text-green-600 hover:bg-green-50"
            }`}
            onClick={() => respond("attending")}
            disabled={isPending}
          >
            ✅ 참여
          </Button>
          <Button
            variant={currentStatus === "absent" ? "default" : "outline"}
            className={`flex-1 ${
              currentStatus === "absent"
                ? "bg-red-500 hover:bg-red-600"
                : "border-red-400 text-red-500 hover:bg-red-50"
            }`}
            onClick={() => respond("absent")}
            disabled={isPending}
          >
            ❌ 불참
          </Button>
          <Button
            variant={currentStatus === "undecided" ? "default" : "outline"}
            className="flex-1"
            onClick={() => respond("undecided")}
            disabled={isPending}
          >
            🤔 미정
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          참여 응답하려면 로그인이 필요합니다
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Separator />

      <div className="flex justify-around text-center text-sm">
        <div>
          <p className="text-lg font-bold text-green-600">{attending.length}</p>
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

      {attending.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {attending.map((a) => (
            <Badge key={a.id} variant="secondary">
              {getName(a)}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
