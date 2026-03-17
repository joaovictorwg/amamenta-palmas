import { z } from "zod";

export const createDonatorSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(8),
  address: z.string().min(5),
});

export type CreateDonatorInput = z.infer<typeof createDonatorSchema>;
