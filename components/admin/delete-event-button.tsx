"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

interface DeleteEventButtonProps {
  eventTitle: string;
  action: () => Promise<void>;
}

export function DeleteEventButton({
  eventTitle,
  action,
}: DeleteEventButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const confirmed = window.confirm(
      `"${eventTitle}" 이벤트를 정말 삭제하시겠습니까?\n참여 응답·정산·카풀 데이터가 모두 함께 삭제되며 되돌릴 수 없습니다.`
    );
    if (!confirmed) return;
    startTransition(() => {
      action();
    });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "삭제 중..." : "강제 삭제"}
    </Button>
  );
}
