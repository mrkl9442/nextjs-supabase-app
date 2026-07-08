import { Card, CardContent } from "@/components/ui/card";

export default function ManageLoading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-1 h-7 w-32 animate-pulse rounded bg-muted" />
      <div className="mb-6 h-4 w-48 animate-pulse rounded bg-muted" />
      <div className="mb-4 grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="py-3">
              <div className="mx-auto mb-1 h-7 w-8 animate-pulse rounded bg-muted" />
              <div className="mx-auto h-3 w-6 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mb-4 h-9 animate-pulse rounded bg-muted" />
      <div className="flex flex-col gap-4">
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
