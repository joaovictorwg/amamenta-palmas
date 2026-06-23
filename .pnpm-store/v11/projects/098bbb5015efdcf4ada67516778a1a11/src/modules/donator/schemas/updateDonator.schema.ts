import { z } from "zod";
import {
  DonatorGuidanceSource,
  DonatorReceptor,
} from "../enums/donatorForm.enum";
import { DonatorStatus } from "../enums/donatorStatus.enum";

export const updateDonatorSchema = z.object({
  registrationNumber: z.string().nullable().optional(),
  registeredAt: z.coerce.date().nullable().optional(),
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  address: z.string().min(3).optional(),
  neighborhood: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  state: z.string().length(2).optional(),
  referencePoint: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  babyName: z.string().nullable().optional(),
  naturality: z.string().nullable().optional(),
  homeCollection: z.boolean().optional(),
  exclusiveDonator: z.boolean().optional(),
  receptor: z.nativeEnum(DonatorReceptor).nullable().optional(),
  receptorOther: z.string().nullable().optional(),
  guidanceSource: z.nativeEnum(DonatorGuidanceSource).nullable().optional(),
  guidanceSourceOther: z.string().nullable().optional(),
  registeredBy: z.string().nullable().optional(),
  status: z.nativeEnum(DonatorStatus).optional(),
});

export type UpdateDonatorDTO = z.infer<typeof updateDonatorSchema>;
