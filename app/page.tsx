import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">모임</h1>
        <p className="max-w-md text-lg text-muted-foreground">
          링크 하나로 10초 만에 참여 의사 표시
          <br />
          주최자는 실시간으로 확인
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="grid grid-cols-3 gap-6 text-center text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-2xl">✅</span>
            <span className="font-medium">참여 취합</span>
            <span className="text-muted-foreground">실시간 응답 확인</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl">💰</span>
            <span className="font-medium">정산</span>
            <span className="text-muted-foreground">자동 N/1 계산</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl">🚗</span>
            <span className="font-medium">카풀</span>
            <span className="text-muted-foreground">드라이버 배정</span>
          </div>
        </div>

        <Button asChild size="lg">
          <Link href="/auth/login">시작하기</Link>
        </Button>
      </div>
    </main>
  );
}
