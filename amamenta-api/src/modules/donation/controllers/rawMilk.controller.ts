import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleRawMilkCollectionRepository } from "../repositories/rawmilkCollection/drizzleRawMilkCollection.repository";
import { CreateRawMilkCollectionUseCase } from "../use-cases/rawMilkCollection/createRawMilkCollection.usecase";
import { TriageRawMilkBatchUseCase } from "../use-cases/rawMilkCollection/triageRawMilkBatch.usecase";
import { ApproveRawMilkUseCase } from "../use-cases/rawMilkCollection/approveRawMilk.usecase";
import { RejectRawMilkUseCase } from "../use-cases/rawMilkCollection/insertRawMilk.usecase";
import { RawMilkTriageStatus } from "../enums/rawMilkTriageStatus.enum";
import { RawMilkStorageStatus } from "../enums/rawMilkStorageStatus.enum";

export async function createRawMilkController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const body = request.body as {
        donorId: string;
        visitId?: string | null;
        collectionDate: string | Date;
        receivedAt: string | Date;
        volumeMl: number;
        createdBy: string;
        observations?: string | null;
    };

    const repository = new DrizzleRawMilkCollectionRepository();
    const useCase = new CreateRawMilkCollectionUseCase(repository);

    const rawMilk = await useCase.execute({
        ...body,
        collectionDate: new Date(body.collectionDate),
        receivedAt: new Date(body.receivedAt),
    });

    return reply.status(201).send(rawMilk);
}

export async function getRawMilkController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const query = request.query as {
        donorId?: string;
        triageStatus?: RawMilkTriageStatus;
        storageStatus?: RawMilkStorageStatus;
        expired?: string | boolean;
    };

    const repository = new DrizzleRawMilkCollectionRepository();
    const data = await repository.findMany({
        donorId: query.donorId,
        triageStatus: query.triageStatus,
        storageStatus: query.storageStatus,
        expired: query.expired === undefined ? undefined : query.expired === true || query.expired === "true",
    });

    return reply.send({ data });
}

export async function getRawMilkByIdController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const repository = new DrizzleRawMilkCollectionRepository();
    const data = await repository.findById(id);

    return reply.send({ data });
}

export async function updateRawMilkController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const body = request.body as {
        donorId?: string;
        visitId?: string | null;
        collectionDate?: string | Date;
        receivedAt?: string | Date;
        volumeMl?: number;
        observations?: string | null;
        discardReason?: string | null;
    };

    const payload: Record<string, unknown> = { ...body };

    if (body.collectionDate) {
        const collectionDate = new Date(body.collectionDate);
        const expirationDate = new Date(collectionDate);
        expirationDate.setDate(expirationDate.getDate() + 15);
        payload.collectionDate = collectionDate;
        payload.expirationDate = expirationDate;
    }

    if (body.receivedAt) {
        payload.receivedAt = new Date(body.receivedAt);
    }

    const repository = new DrizzleRawMilkCollectionRepository();
    const data = await repository.update(id, payload as any);

    return reply.send({ data });
}

export async function triageRawMilkBatchController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const { rawMilkIds, status, rejectReason } = request.body as {
        rawMilkIds: string[];
        status: RawMilkTriageStatus;
        rejectReason?: string;
    };

    const repository = new DrizzleRawMilkCollectionRepository();
    const useCase = new TriageRawMilkBatchUseCase(repository);
    const result = await useCase.execute({ rawMilkIds, status, rejectReason });

    return reply.send({ updated: result.length });
}

export async function approveRawMilkController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const repository = new DrizzleRawMilkCollectionRepository();
    const useCase = new ApproveRawMilkUseCase(repository);
    const data = await useCase.execute(id);

    return reply.send({ data });
}

export async function rejectRawMilkController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const { discardReason } = request.body as { discardReason: string };

    const repository = new DrizzleRawMilkCollectionRepository();
    const useCase = new RejectRawMilkUseCase(repository);
    const data = await useCase.execute(id, discardReason);

    return reply.send({ data });
}