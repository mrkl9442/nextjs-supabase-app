import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DUMMY_EVENT, DUMMY_ATTENDANCES } from "@/lib/fixtures";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventManagePage({ params }: Props) {
  const { id } = await params;
  const event = { ...DUMMY_EVENT, id };

  const attending = DUMMY_ATTENDANCES.filter((a) => a.status === "attending");
  const absent = DUMMY_ATTENDANCES.filter((a) => a.status === "absent");
  const undecided = DUMMY_ATTENDANCES.filter((a) => a.status === "undecided");
  const notResponded = (event.capacity ?? 0) - DUMMY_ATTENDANCES.length;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-xl font-bold">이벤트 관리</h1>

      <div className="mb-4 grid grid-cols-4 gap-2 text-center">
        <Card>
          <CardContent className="py-3">
            <p className="text-xl font-bold text-green-600">
              {attending.length}
            </p>
            <p className="text-xs text-muted-foreground">참여</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xl font-bold text-red-500">{absent.length}</p>
            <p className="text-xs text-muted-foreground">불참</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xl font-bold text-yellow-500">
              {undecided.length}
            </p>
            <p className="text-xs text-muted-foreground">미정</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xl font-bold text-gray-400">
              {notResponded > 0 ? notResponded : 0}
            </p>
            <p className="text-xs text-muted-foreground">미응답</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <Button variant="outline" className="w-full" disabled>
          🔗 링크 복사
        </Button>
        <Button variant="outline" className="w-full" disabled>
          💬 카카오 공유
        </Button>
        <Button variant="outline" className="w-full" disabled>
          📢 공지 작성
        </Button>
        <Button variant="outline" className="w-full" disabled>
          📣 독촉 메시지
        </Button>
      </div>

      <Separator className="my-4" />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">참여 확정자</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1">
          {attending.map((a) => (
            <Badge key={a.id} variant="secondary">
              {a.user_name}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
