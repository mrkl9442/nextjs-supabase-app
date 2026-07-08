"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";

type AttendanceRow = {
  id: string;
  user_id: string;
  status: string;
  profiles: { full_name: string | null; username: string | null } | null;
};

interface Props {
  eventId: string;
  initialAttendances: AttendanceRow[];
}

export function RealtimeAttendances({ eventId, initialAttendances }: Props) {
  const [attendances, setAttendances] =
    useState<AttendanceRow[]>(initialAttendances);

  // Server Action 후 revalidatePath로 서버가 재렌더될 때 새 props를 반영
  useEffect(() => {
    setAttendances(initialAttendances);
  }, [initialAttendances]);

  useEffect(() => {
    const supabase = createClient();

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
        async (payload) => {
          if (payload.eventType === "DELETE") {
            setAttendances((prev) =>
              prev.filter((a) => a.id !== (payload.old as { id: string }).id)
            );
          } else {
            // INSERT / UPDATE — 프로필 포함해서 재조회
            const { data } = await supabase
              .from("attendances")
              .select("id, user_id, status, profiles(full_name, username)")
              .eq("id", (payload.new as { id: string }).id)
              .single();

            if (data) {
              const row = data as unknown as AttendanceRow;
              setAttendances((prev) => {
                const exists = prev.some((a) => a.id === row.id);
                if (exists) {
                  return prev.map((a) => (a.id === row.id ? row : a));
                }
                return [...prev, row];
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const getName = (a: AttendanceRow) =>
    a.profiles?.full_name ?? a.profiles?.username ?? "참여자";

  const attending = attendances.filter((a) => a.status === "attending");
  const absent = attendances.filter((a) => a.status === "absent");
  const undecided = attendances.filter((a) => a.status === "undecided");

  return (
    <>
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
    </>
  );
}
