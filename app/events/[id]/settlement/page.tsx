import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DUMMY_EXPENSES, DUMMY_ATTENDANCES } from "@/lib/fixtures";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SettlementPage({ params }: Props) {
  await params;

  const total = DUMMY_EXPENSES.reduce((sum, e) => sum + e.amount, 0);
  const attendingCount = DUMMY_ATTENDANCES.filter(
    (a) => a.status === "attending"
  ).length;
  const perPerson = attendingCount > 0 ? Math.ceil(total / attendingCount) : 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-xl font-bold">정산</h1>

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">지출 항목</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {DUMMY_EXPENSES.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between text-sm"
            >
              <span>{expense.label}</span>
              <span className="font-medium">
                {expense.amount.toLocaleString()}원
              </span>
            </div>
          ))}

          <Separator />

          <div className="flex items-center justify-between font-semibold">
            <span>합계</span>
            <span>{total.toLocaleString()}원</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="py-4 text-center">
          <p className="text-sm text-muted-foreground">
            참여 {attendingCount}명 기준 1인당
          </p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-400">
            {perPerson.toLocaleString()}원
          </p>
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <Input placeholder="항목명 (예: 식비)" className="flex-1" />
          <Input placeholder="금액" type="number" className="w-28" />
          <Button variant="outline" disabled>
            추가
          </Button>
        </div>
      </div>

      <Button className="w-full" disabled>
        📋 정산 내역 복사 (Phase 2에서 연동)
      </Button>
    </div>
  );
}
