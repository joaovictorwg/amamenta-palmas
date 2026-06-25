import { z } from "zod";
import { PasteurizedMilkStockStatus } from "../enums/pasteurizedMilkStatusStock.enum";

export const pasteurizedMilkIdParamsSchema = z.object({
    id: z.string().uuid(),
});

export const createPasteurizedMilkSchema = z.object({
    batchId: z.string().uuid(),
    volumeMl: z.number().int().positive(),
    pasteurizedAt: z.coerce.date(),
    stockStatus: z.nativeEnum(PasteurizedMilkStockStatus).optional(),
});

export const pasteurizedMilkQuerySchema = z.object({
    stockStatus: z.nativeEnum(PasteurizedMilkStockStatus).optional(),
    batchId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const distributePasteurizedMilkSchema = z.object({
    recipientIdentifier: z.string().trim().min(1),
});

export const discardPasteurizedMilkSchema = z.object({
    discardReason: z.string().min(1).nullable().optional(),
});
