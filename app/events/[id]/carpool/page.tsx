import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DUMMY_DRIVERS, DUMMY_CARPOOL_MEMBERS } from "@/lib/fixtures";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CarpoolPage({ params }: Props) {
  await params;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-xl font-bold">카풀</h1>

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">드라이버 등록</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>출발지</Label>
            <Input placeholder="예: 강남역 2번 출구" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>최대 탑승 인원</Label>
            <Input type="number" placeholder="예: 3" />
          </div>
          <Button variant="outline" disabled>
            드라이버 등록 (Phase 3에서 연동)
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {DUMMY_DRIVERS.map((driver) => {
          const members = DUMMY_CARPOOL_MEMBERS.filter(
            (m) => m.driver_id === driver.id
          );
          const remaining = driver.max_passengers - members.length;

          return (
            <Card key={driver.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {driver.driver_name}
                  </CardTitle>
                  <Badge variant={remaining > 0 ? "secondary" : "destructive"}>
                    {remaining > 0 ? `잔여 ${remaining}석` : "만석"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <p className="text-muted-foreground">📍 {driver.departure}</p>
                <div className="flex flex-wrap gap-1">
                  {members.map((m) => (
                    <Badge key={m.id} variant="outline">
                      {m.passenger_name}
                    </Badge>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={remaining === 0}
                  className="mt-1"
                >
                  {remaining > 0 ? "탑승 신청 (Phase 3에서 연동)" : "만석"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
