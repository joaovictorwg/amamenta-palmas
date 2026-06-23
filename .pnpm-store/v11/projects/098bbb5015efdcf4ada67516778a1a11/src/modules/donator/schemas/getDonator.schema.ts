import { z } from "zod";
import { DonatorStatus } from "../enums/donatorStatus.enum";

export const getDonatorsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  name: z.string().optional(),
  city: z.string().optional(),
  status: z.nativeEnum(DonatorStatus).optional(),
  pendingExams: z.coerce.boolean().optional(),
});

export const getDonatorParamsSchema = z.object({
  id: z.string().uuid(),
});

export type GetDonatorsQuery = z.infer<typeof getDonatorsQuerySchema>;
export type GetDonatorParams = z.infer<typeof getDonatorParamsSchema>;
