import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function EventDetailLoading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Card className="mb-4">
        <CardHeader>
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-56 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 flex-1 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
          <Separator />
          <div className="flex justify-around">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="h-7 w-8 animate-pulse rounded bg-muted" />
                <div className="h-3 w-6 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
