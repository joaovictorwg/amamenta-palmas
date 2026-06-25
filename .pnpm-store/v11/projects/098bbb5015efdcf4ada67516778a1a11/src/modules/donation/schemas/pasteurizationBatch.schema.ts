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
    volumeFinalMl: z.number().int().positive(),
    generatedUnits: z.number().int().positive(),
}).superRefine((data, ctx) => {
    if (data.generatedUnits > data.volumeFinalMl) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["generatedUnits"],
            message: "generatedUnits must be less than or equal to volumeFinalMl",
        });
    }
});

export const rejectPasteurizationBatchSchema = z.object({
    reason: z.string().trim().min(1),
});

export const pasteurizationBatchQuerySchema = z.object({
    microbiologyStatus: z.nativeEnum(MicrobiologyStatus).optional(),
    operatorId: z.string().uuid().optional(),
});
