"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { addAnnouncementAction } from "@/app/events/[id]/manage/actions";

type Announcement = {
  id: string;
  content: string;
  createdAt: string;
};

interface Props {
  eventId?: string;
  isHost: boolean;
  announcements: Announcement[];
}

export function AnnouncementSection({ eventId, isHost, announcements }: Props) {
  const [isWriting, setIsWriting] = useState(false);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!eventId || !draft.trim()) return;
    setServerError(null);
    startTransition(async () => {
      const result = await addAnnouncementAction(eventId, draft);
      if (result?.error) {
        setServerError(result.error);
      } else {
        setDraft("");
        setIsWriting(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">📢 공지사항</CardTitle>
          {isHost && !isWriting && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsWriting(true)}
            >
              공지 작성
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isHost && isWriting && (
          <div className="flex flex-col gap-2">
            <Textarea
              placeholder="참여자에게 전달할 공지 내용을 입력하세요"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="resize-none"
            />
            {serverError && (
              <p className="text-xs text-destructive">{serverError}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={isPending}
                onClick={() => {
                  setIsWriting(false);
                  setDraft("");
                  setServerError(null);
                }}
              >
                취소
              </Button>
              <Button
                size="sm"
                disabled={!draft.trim() || isPending}
                onClick={handleSubmit}
              >
                {isPending ? "등록 중…" : "등록"}
              </Button>
            </div>
          </div>
        )}

        {announcements.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            등록된 공지사항이 없습니다
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {announcements.map((a, i) => (
              <div key={a.id}>
                {i > 0 && <Separator />}
                <div className="flex flex-col gap-1 py-1">
                  <div className="flex items-center gap-2">
                    {i === 0 && <Badge variant="secondary">최신</Badge>}
                    <span className="text-xs text-muted-foreground">
                      {a.createdAt}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{a.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
