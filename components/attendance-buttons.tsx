"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { respondToEventAction } from "@/app/events/[id]/actions";
import type { AttendanceStatus } from "@/types";

interface Props {
  eventId: string;
  currentStatus: AttendanceStatus | null;
}

export function AttendanceButtons({ eventId, currentStatus }: Props) {
  const [status, setStatus] = useState<AttendanceStatus | null>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const respond = (newStatus: AttendanceStatus) => {
    startTransition(async () => {
      setError(null);
      try {
        await respondToEventAction(eventId, newStatus);
        setStatus(newStatus);
        router.refresh(); // 서버 컴포넌트 재렌더 → 최신 참여 카운트 반영
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Button
          variant={status === "attending" ? "default" : "outline"}
          className={`flex-1 ${
            status === "attending"
              ? "bg-green-500 hover:bg-green-600"
              : "border-green-500 text-green-600 hover:bg-green-50"
          }`}
          onClick={() => respond("attending")}
          disabled={isPending}
        >
          ✅ 참여
        </Button>
        <Button
          variant={status === "absent" ? "default" : "outline"}
          className={`flex-1 ${
            status === "absent"
              ? "bg-red-500 hover:bg-red-600"
              : "border-red-400 text-red-500 hover:bg-red-50"
          }`}
          onClick={() => respond("absent")}
          disabled={isPending}
        >
          ❌ 불참
        </Button>
        <Button
          variant={status === "undecided" ? "default" : "outline"}
          className="flex-1"
          onClick={() => respond("undecided")}
          disabled={isPending}
        >
          🤔 미정
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
