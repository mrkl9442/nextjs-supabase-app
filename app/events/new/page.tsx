import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">이벤트 만들기</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">이벤트 정보</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">제목 *</Label>
            <Input id="title" placeholder="예: 7월 수영 모임" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event_date">날짜 및 시간 *</Label>
            <Input id="event_date" type="datetime-local" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">장소</Label>
            <Input id="location" placeholder="예: 잠실 올림픽 수영장" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              placeholder="모임 안내 메시지를 입력하세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="capacity">정원</Label>
              <Input id="capacity" type="number" placeholder="예: 15" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fee">참여비 (원)</Label>
              <Input id="fee" type="number" placeholder="예: 15000" />
            </div>
          </div>

          <Button className="mt-2 w-full" disabled>
            이벤트 생성 (Phase 1에서 연동)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
