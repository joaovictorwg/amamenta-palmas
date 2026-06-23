import { z } from "zod";
import { ExamResult } from "../enums/examResult.enum";

export const registerDonatorExamsSchema = z.object({
  examDate: z.coerce.date(),
  vdrl: z.nativeEnum(ExamResult),
  hbsag: z.nativeEnum(ExamResult),
  ftaabs: z.nativeEnum(ExamResult),
  hiv: z.nativeEnum(ExamResult),
  hbPercentage: z.coerce.number().min(0).optional(),
  htPercentage: z.coerce.number().min(0).optional(),
});

export type RegisterDonatorExamsInput = z.infer<
  typeof registerDonatorExamsSchema
>;
