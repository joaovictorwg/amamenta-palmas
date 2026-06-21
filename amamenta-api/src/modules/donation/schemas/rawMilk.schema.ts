import { z } from "zod";
import { RawMilkTriageStatus } from "../enums/rawMilkTriageStatus.enum";
import { RawMilkStorageStatus } from "../enums/rawMilkStorageStatus.enum";

export const rawMilkIdParamsSchema = z.object({
    id: z.string().uuid(),
});

export const createRawMilkSchema = z.object({
    donorId: z.string().uuid(),
    visitId: z.string().uuid().nullable().optional(),
    collectionDate: z.coerce.date(),
    receivedAt: z.coerce.date(),
    volumeMl: z.number().int().positive(),
    createdBy: z.string().uuid(),
    observations: z.string().nullable().optional(),
});

export const updateRawMilkSchema = createRawMilkSchema.partial().extend({
    discardReason: z.string().nullable().optional(),
});

export const triageRawMilkBatchSchema = z.object({
    rawMilkIds: z.array(z.string().uuid()).min(1),
    status: z.nativeEnum(RawMilkTriageStatus),
    rejectReason: z.string().optional(),
});

export const rawMilkQuerySchema = z.object({
   page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(10),
    donorId: z.string().uuid().optional(),
    triageStatus: z.nativeEnum(RawMilkTriageStatus).optional(),
    storageStatus: z.nativeEnum(RawMilkStorageStatus).optional(),
    expired: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
    collectionDateFrom: z.coerce.date().optional(),
    collectionDateTo: z.coerce.date().optional(),
});

export const rejectRawMilkSchema = z.object({
    discardReason: z.string().min(1),
});
