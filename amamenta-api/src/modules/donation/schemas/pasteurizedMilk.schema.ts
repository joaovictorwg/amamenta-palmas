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
});

export const distributePasteurizedMilkSchema = z.object({
    recipientIdentifier: z.string().min(1).nullable().optional(),
});

export const discardPasteurizedMilkSchema = z.object({
    discardReason: z.string().min(1).nullable().optional(),
});
