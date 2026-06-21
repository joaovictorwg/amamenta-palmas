import { FastifyReply, FastifyRequest } from "fastify";
import { CreatePasteurizationUseBatchCase } from "../use-cases/PasteurizationBatch/createPasteurizationBatch.usecase";
import { ApproveBatchMicrobiologyUseCase } from "../use-cases/PasteurizationBatch/approveBatchMicrobiology.usecase";
import { RejectBatchMicrobiologyUseCase } from "../use-cases/PasteurizationBatch/rejectBatchMicrobiology.usecase";
import { DrizzlePasteurizationBatchRepository } from "../repositories/pasteurizedBach/drizzlePasteurizationBatch.repository";
import { DrizzleRawMilkCollectionRepository } from "../repositories/rawmilkCollection/drizzleRawMilkCollection.repository";
import { DrizzleBatchRawMilkRepository } from "../repositories/batchRawMilk/drizzleBatchRawMilk.repository";
import { DrizzlePasteurizedMilkUnitRepository } from "../repositories/pasteurizedMilkUnit/drizzlePasteurizedMilkUnit.repository";
import { MicrobiologyStatus } from "../enums/MicrobiologyStatus.enum";

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

    const useCase = new CreatePasteurizationUseBatchCase(
        new DrizzlePasteurizationBatchRepository(),
        new DrizzleRawMilkCollectionRepository(),
        new DrizzleBatchRawMilkRepository(),
    );

    const data = await useCase.execute({
        ...body,
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

    const repository = new DrizzlePasteurizationBatchRepository();
    const data = await repository.findMany({
        microbiologyStatus: query.microbiologyStatus,
        operatorId: query.operatorId,
    });

    return reply.send({ data });
}

export async function getPasteurizationBatchByIdController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const repository = new DrizzlePasteurizationBatchRepository();
    const data = await repository.findById(id);

    return reply.send({ data });
}

export async function approvePasteurizationBatchController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const body = request.body as {
        volumeFinalMl?: number;
        units: Array<{ volumeMl: number }>;
    };

    const useCase = new ApproveBatchMicrobiologyUseCase(
        new DrizzlePasteurizationBatchRepository(),
        new DrizzlePasteurizedMilkUnitRepository(),
    );

    const data = await useCase.execute({
        batchId: id,
        volumeFinalMl: body.volumeFinalMl ?? 0,
        units: body.units,
    });

    return reply.send({ data });
}

export async function rejectPasteurizationBatchController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const body = request.body as {
        units: Array<{ volumeMl: number }>;
    };

    const useCase = new RejectBatchMicrobiologyUseCase(
        new DrizzlePasteurizationBatchRepository(),
        new DrizzlePasteurizedMilkUnitRepository(),
        new DrizzleBatchRawMilkRepository(),
    );

    const data = await useCase.execute({
        batchId: id,
        units: body.units,
    });

    return reply.send({ data });
}