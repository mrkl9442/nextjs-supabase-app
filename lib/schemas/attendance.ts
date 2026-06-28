import { z } from "zod";

export const attendanceSchema = z.object({
  status: z.enum(["attending", "absent", "undecided"], {
    error: "참여 여부를 선택하세요",
  }),
});

export type AttendanceInput = z.infer<typeof attendanceSchema>;
