import { z } from "zod";

export const updateDonatorSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export type UpdateDonatorDTO = z.infer<typeof updateDonatorSchema>;
