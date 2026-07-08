import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-bold text-muted-foreground">404</p>
      <h2 className="text-xl font-bold">페이지를 찾을 수 없습니다</h2>
      <p className="text-sm text-muted-foreground">
        요청하신 페이지가 존재하지 않거나 삭제되었습니다.
      </p>
      <Button asChild variant="outline">
        <Link href="/">홈으로 돌아가기</Link>
      </Button>
    </div>
  );
}
