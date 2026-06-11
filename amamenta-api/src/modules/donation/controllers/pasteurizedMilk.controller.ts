import { FastifyReply, FastifyRequest } from "fastify";
import { CreatePasteurizedMilkUnitUseCase } from "../use-cases/PasteurizedMilkUnit/createPasteurizedMilkUnit.usecase";
import { DistributePasteurizedMilkUseCase } from "../use-cases/PasteurizedMilkUnit/distributePasteurizedMilk.usecase";
import { DrizzlePasteurizedMilkUnitRepository } from "../repositories/pasteurizedMilkUnit/drizzlePasteurizedMilkUnit.repository";
import { PasteurizedMilkStockStatus } from "../enums/pasteurizedMilkStatusStock.enum";

export async function createPasteurizedMilkController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const body = request.body as {
        batchId: string;
        volumeMl: number;
        pasteurizedAt: string | Date;
        stockStatus?: PasteurizedMilkStockStatus;
    };

    const useCase = new CreatePasteurizedMilkUnitUseCase(new DrizzlePasteurizedMilkUnitRepository());
    const data = await useCase.execute({
        ...body,
        pasteurizedAt: new Date(body.pasteurizedAt),
    });

    return reply.status(201).send({ data });
}

export async function getPasteurizedMilkController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const query = request.query as {
        stockStatus?: PasteurizedMilkStockStatus;
        batchId?: string;
    };

    const repository = new DrizzlePasteurizedMilkUnitRepository();
    const data = await repository.findMany({
        stockStatus: query.stockStatus,
        batchId: query.batchId,
    });

    return reply.send({ data });
}

export async function getPasteurizedMilkByIdController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const repository = new DrizzlePasteurizedMilkUnitRepository();
    const data = await repository.findById(id);

    return reply.send({ data });
}

export async function distributePasteurizedMilkController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const { recipientIdentifier } = request.body as { recipientIdentifier?: string | null };

    const useCase = new DistributePasteurizedMilkUseCase(new DrizzlePasteurizedMilkUnitRepository());
    const data = await useCase.execute({ id, recipientIdentifier });

    return reply.send({ data });
}

export async function discardPasteurizedMilkController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const { discardReason } = request.body as { discardReason?: string | null };

    const repository = new DrizzlePasteurizedMilkUnitRepository();
    const data = await repository.update(id, {
        stockStatus: PasteurizedMilkStockStatus.DISCARDED,
        discardReason: discardReason ?? null,
    });

    return reply.send({ data });
}