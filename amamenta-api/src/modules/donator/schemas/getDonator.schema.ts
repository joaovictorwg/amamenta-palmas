import { z } from "zod";

export const getDonatorsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),

  name: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type GetDonatorsQuery = z.infer<typeof getDonatorsQuerySchema>;
