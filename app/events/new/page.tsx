import { CreateEventForm } from "@/components/create-event-form";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">이벤트 만들기</h1>
      <CreateEventForm />
    </div>
  );
}
