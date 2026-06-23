import { z } from "zod";
import { VisitStatus, VisitType } from "../enums/visit.enum";

export const visitIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createVisitSchema = z.object({
  donatorId: z.string().uuid(),
  type: z.nativeEnum(VisitType),
  scheduledAt: z.coerce.date().nullable().optional(),
  needsKit: z.boolean().optional(),
  zipCode: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  addressNumber: z.string().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  observations: z.string().nullable().optional(),
});

export const requestVisitSchema = z.object({
  tenantId: z.string().uuid(),
  phone: z.string().min(8),
  type: z.nativeEnum(VisitType),
});

export const listVisitsQuerySchema = z.object({
  status: z.nativeEnum(VisitStatus).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const updateVisitSchema = z.object({
  type: z.nativeEnum(VisitType).optional(),
  status: z.nativeEnum(VisitStatus).optional(),
  scheduledAt: z.coerce.date().nullable().optional(),
  needsKit: z.boolean().optional(),
  zipCode: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  addressNumber: z.string().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  observations: z.string().nullable().optional(),
});

export const updateVisitStatusSchema = z.object({
  status: z.nativeEnum(VisitStatus),
});

export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type RequestVisitInput = z.infer<typeof requestVisitSchema>;
export type ListVisitsQuery = z.infer<typeof listVisitsQuerySchema>;
export type UpdateVisitInput = z.infer<typeof updateVisitSchema>;
export type UpdateVisitStatusInput = z.infer<typeof updateVisitStatusSchema>;
export type VisitIdParams = z.infer<typeof visitIdParamsSchema>;
