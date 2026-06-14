import { z } from "zod";
import { MicrobiologyStatus } from "../enums/MicrobiologyStatus.enum";

export const pasteurizationBatchIdParamsSchema = z.object({
    id: z.string().uuid(),
});

export const createPasteurizationBatchSchema = z.object({
    batchCode: z.string().min(1),
    pasteurizedAt: z.coerce.date(),
    operatorId: z.string().uuid(),
    rawMilkIds: z.array(z.string().uuid()).min(1),
    observations: z.string().nullable().optional(),
});

export const approvePasteurizationBatchSchema = z.object({
    volumeFinalMl: z.number().int().positive().optional(),
    units: z.array(
        z.object({
            volumeMl: z.number().int().positive(),
        })
    ).min(1),
});

export const rejectPasteurizationBatchSchema = z.object({
    units: z.array(
        z.object({
            volumeMl: z.number().int().positive(),
        })
    ).min(1),
});

export const pasteurizationBatchQuerySchema = z.object({
    microbiologyStatus: z.nativeEnum(MicrobiologyStatus).optional(),
    operatorId: z.string().uuid().optional(),
});
