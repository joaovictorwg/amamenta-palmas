import { FastifyReply, FastifyRequest } from "fastify";
import { CreatePasteurizationUseBatchCase } from "../use-cases/PasteurizationBatch/createPasteurizationBatch.usecase";
import { ApproveBatchMicrobiologyUseCase } from "../use-cases/PasteurizationBatch/approveBatchMicrobiology.usecase";
import { RejectBatchMicrobiologyUseCase } from "../use-cases/PasteurizationBatch/rejectBatchMicrobiology.usecase";
import { DrizzlePasteurizationBatchRepository } from "../repositories/pasteurizedBach/drizzlePasteurizationBatch.repository";
import { DrizzleRawMilkCollectionRepository } from "../repositories/rawmilkCollection/drizzleRawMilkCollection.repository";
import { DrizzleBatchRawMilkRepository } from "../repositories/batchRawMilk/drizzleBatchRawMilk.repository";
import { DrizzlePasteurizedMilkUnitRepository } from "../repositories/pasteurizedMilkUnit/drizzlePasteurizedMilkUnit.repository";
import { MicrobiologyStatus } from "../enums/MicrobiologyStatus.enum";
import { getRequestTenantId } from "./getRequestTenantId";
import {
    approvePasteurizationBatchSchema,
    pasteurizationBatchIdParamsSchema,
    rejectPasteurizationBatchSchema,
} from "../schemas/pasteurizationBatch.schema";
import { AppError } from "@/shared/errors/AppError";
import { ValidationError } from "@/shared/errors/ValidationError";
import { ZodError } from "zod";

function formatZodError(error: ZodError): string {
    if (error.issues.length === 1) {
        return error.issues[0]?.message ?? "Invalid request body";
    }

    return error.issues.map((issue) => issue.message).join(", ");
}

export async function createPasteurizationBatchController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const body = request.body as {
        batchCode: string;
        pasteurizedAt: string | Date;
        operatorId: string;
        rawMilkIds: string[];
        observations?: string | null;
    };

    const tenantId = getRequestTenantId(request);
    const useCase = new CreatePasteurizationUseBatchCase(
        new DrizzlePasteurizationBatchRepository(),
        new DrizzleRawMilkCollectionRepository(),
        new DrizzleBatchRawMilkRepository(),
    );

    const data = await useCase.execute({
        ...body,
        tenantId,
        pasteurizedAt: new Date(body.pasteurizedAt),
    });

    return reply.status(201).send({ data });
}

export async function getPasteurizationBatchesController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const query = request.query as {
        microbiologyStatus?: MicrobiologyStatus;
        operatorId?: string;
    };

    const tenantId = getRequestTenantId(request);
    const repository = new DrizzlePasteurizationBatchRepository();
    const data = await repository.findMany({
        microbiologyStatus: query.microbiologyStatus,
        operatorId: query.operatorId,
    }, tenantId);

    return reply.send({ data });
}

export async function getPasteurizationBatchByIdController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const tenantId = getRequestTenantId(request);
    const repository = new DrizzlePasteurizationBatchRepository();
    const data = await repository.findById(id, tenantId);

    return reply.send({ data });
}

export async function approvePasteurizationBatchController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    try {
        const { id } = pasteurizationBatchIdParamsSchema.parse(request.params);
        const body = approvePasteurizationBatchSchema.parse(request.body);
        const tenantId = getRequestTenantId(request);

        const useCase = new ApproveBatchMicrobiologyUseCase(
            new DrizzlePasteurizationBatchRepository(),
            new DrizzlePasteurizedMilkUnitRepository(),
        );

        await useCase.execute({
            tenantId,
            batchId: id,
            volumeFinalMl: body.volumeFinalMl,
            generatedUnits: body.generatedUnits,
        });

        return reply.status(204).send();
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        if (error instanceof ZodError) {
            throw new ValidationError(formatZodError(error));
        }

        throw error;
    }
}

export async function rejectPasteurizationBatchController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    try {
        const { id } = pasteurizationBatchIdParamsSchema.parse(request.params);
        const body = rejectPasteurizationBatchSchema.parse(request.body);
        const tenantId = getRequestTenantId(request);

        const useCase = new RejectBatchMicrobiologyUseCase(
            new DrizzlePasteurizationBatchRepository(),
            new DrizzlePasteurizedMilkUnitRepository(),
            new DrizzleBatchRawMilkRepository(),
        );

        await useCase.execute({
            tenantId,
            batchId: id,
            reason: body.reason,
        });

        return reply.status(204).send();
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        if (error instanceof ZodError) {
            throw new ValidationError(formatZodError(error));
        }

        throw error;
    }
}
