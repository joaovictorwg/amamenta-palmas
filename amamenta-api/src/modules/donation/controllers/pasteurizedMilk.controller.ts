import { FastifyReply, FastifyRequest } from "fastify";
import { CreatePasteurizedMilkUnitUseCase } from "../use-cases/PasteurizedMilkUnit/createPasteurizedMilkUnit.usecase";
import { DistributePasteurizedMilkUseCase } from "../use-cases/PasteurizedMilkUnit/distributePasteurizedMilk.usecase";
import { DrizzlePasteurizedMilkUnitRepository } from "../repositories/pasteurizedMilkUnit/drizzlePasteurizedMilkUnit.repository";
import { DrizzlePasteurizationBatchRepository } from "../repositories/pasteurizedBach/drizzlePasteurizationBatch.repository";
import { PasteurizedMilkStockStatus } from "../enums/pasteurizedMilkStatusStock.enum";
import { getRequestTenantId } from "./getRequestTenantId";

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

    const tenantId = getRequestTenantId(request);
    const useCase = new CreatePasteurizedMilkUnitUseCase(
        new DrizzlePasteurizedMilkUnitRepository(),
        new DrizzlePasteurizationBatchRepository(),
    );
    const data = await useCase.execute({
        ...body,
        tenantId,
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

    const tenantId = getRequestTenantId(request);
    const repository = new DrizzlePasteurizedMilkUnitRepository();
    const data = await repository.findMany({
        stockStatus: query.stockStatus,
        batchId: query.batchId,
    }, tenantId);

    return reply.send({ data });
}

export async function getPasteurizedMilkByIdController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const tenantId = getRequestTenantId(request);
    const repository = new DrizzlePasteurizedMilkUnitRepository();
    const data = await repository.findById(id, tenantId);

    return reply.send({ data });
}

export async function distributePasteurizedMilkController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const tenantId = getRequestTenantId(request);
    const { recipientIdentifier } = request.body as { recipientIdentifier?: string | null };

    const useCase = new DistributePasteurizedMilkUseCase(new DrizzlePasteurizedMilkUnitRepository());
    const data = await useCase.execute({ tenantId, id, recipientIdentifier });

    return reply.send({ data });
}

export async function discardPasteurizedMilkController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const tenantId = getRequestTenantId(request);
    const { discardReason } = request.body as { discardReason?: string | null };

    const repository = new DrizzlePasteurizedMilkUnitRepository();
    const data = await repository.update(id, tenantId, {
        stockStatus: PasteurizedMilkStockStatus.DISCARDED,
        discardReason: discardReason ?? null,
    });

    return reply.send({ data });
}
