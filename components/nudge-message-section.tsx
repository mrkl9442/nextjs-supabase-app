"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Participant = {
  name: string;
};

interface Props {
  eventTitle: string;
  eventDate: string;
  noResponse: Participant[];
}

export function NudgeMessageSection({
  eventTitle,
  eventDate,
  noResponse,
}: Props) {
  const [copied, setCopied] = useState(false);

  const names = noResponse.map((p) => p.name).join(", ");
  const message =
    noResponse.length === 0
      ? ""
      : `안녕하세요! 🙏\n\n[${eventTitle}] (${eventDate}) 참여 여부를 아직 응답하지 않으신 분들이 있어요.\n\n미응답: ${names}\n\n참여 여부를 알려주시면 감사하겠습니다 😊`;

  const handleCopy = async () => {
    if (!message) return;
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">📣 독촉 메시지</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <p className="mb-2 text-xs text-muted-foreground">미응답자</p>
          {noResponse.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              모든 참여자가 응답했습니다 🎉
            </p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {noResponse.map((p) => (
                <Badge key={p.name} variant="outline">
                  {p.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {noResponse.length > 0 && (
          <>
            <div className="rounded-md bg-muted px-3 py-2">
              <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                {message}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={handleCopy}
            >
              {copied ? "복사됨! ✓" : "📋 독촉 메시지 복사"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
