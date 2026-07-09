import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  event_date: z.string().min(1, "날짜를 입력하세요"),
  location: z.string().optional(),
  description: z.string().optional(),
  capacity: z
    .number()
    .int()
    .positive("정원은 1명 이상이어야 합니다")
    .optional(),
  fee: z.number().int().min(0, "참여비는 0원 이상이어야 합니다").optional(),
  cover_image_url: z.string().url().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
