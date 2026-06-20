import { z } from "zod";
import {
  DonatorGuidanceSource,
  DonatorReceptor,
} from "../enums/donatorForm.enum";

export const createDonatorSchema = z.object({
  registrationNumber: z.string().optional(),
  registeredAt: z.coerce.date().optional(),
  name: z.string().min(3),
  phone: z.string().min(10),
  address: z.string().min(3),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2),
  referencePoint: z.string().optional(),
  birthDate: z.string().optional(),
  babyName: z.string().optional(),
  naturality: z.string().optional(),
  homeCollection: z.boolean().optional(),
  exclusiveDonator: z.boolean().optional(),
  receptor: z.nativeEnum(DonatorReceptor).optional(),
  receptorOther: z.string().optional(),
  guidanceSource: z.nativeEnum(DonatorGuidanceSource).optional(),
  guidanceSourceOther: z.string().optional(),
  registeredBy: z.string().optional(),
});

export type CreateDonatorInput = z.infer<typeof createDonatorSchema>;
