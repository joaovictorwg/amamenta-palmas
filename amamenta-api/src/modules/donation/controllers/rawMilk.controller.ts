import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleRawMilkCollectionRepository } from "../repositories/rawmilkCollection/drizzleRawMilkCollection.repository";
import { CreateRawMilkCollectionUseCase } from "../use-cases/rawMilkCollection/createRawMilkCollection.usecase";
import { TriageRawMilkBatchUseCase } from "../use-cases/rawMilkCollection/triageRawMilkBatch.usecase";
import { ApproveRawMilkUseCase } from "../use-cases/rawMilkCollection/approveRawMilk.usecase";
import { RejectRawMilkUseCase } from "../use-cases/rawMilkCollection/insertRawMilk.usecase";
import { RawMilkTriageStatus } from "../enums/rawMilkTriageStatus.enum";
import { RawMilkStorageStatus } from "../enums/rawMilkStorageStatus.enum";
import {
    DrizzleDonatorExamsRepository,
    DrizzleDonatorRepository,
} from "@/modules/donator/repositories/drizzleDonator.repository";
import { NotFoundError } from "@/shared/errors/NotFoundError";
import { getRequestTenantId } from "./getRequestTenantId";

type CreateRawMilkBody = {
    donorId: string;
    visitId?: string | null;
    collectionDate: string | Date;
    receivedAt: string | Date;
    volumeMl: number;
    observations?: string | null;
};

type RawMilkQuery = {
    donorId?: string;
    triageStatus?: RawMilkTriageStatus;
    storageStatus?: RawMilkStorageStatus;
    expired?: boolean;
    collectionDateFrom?: string | Date;
    collectionDateTo?: string | Date;
    page?: number;
    limit?: number;
};

type UpdateRawMilkBody = {
    donorId?: string;
    visitId?: string | null;
    collectionDate?: string | Date;
    receivedAt?: string | Date;
    volumeMl?: number;
    observations?: string | null;
    discardReason?: string | null;
};

export async function createRawMilkController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const body = request.body as CreateRawMilkBody;
    const tenantId = getRequestTenantId(request);
    const repository = new DrizzleRawMilkCollectionRepository();
    const donatorRepository = new DrizzleDonatorRepository();
    const donatorExamsRepository = new DrizzleDonatorExamsRepository();
    const useCase = new CreateRawMilkCollectionUseCase(
        repository,
        donatorRepository,
        donatorExamsRepository,
    );

    const rawMilk = await useCase.execute({
        ...body,
        tenantId,
        createdBy: request.user.id,
        collectionDate: new Date(body.collectionDate),
        receivedAt: new Date(body.receivedAt),
    });

    return reply.status(201).send(rawMilk);
}

export async function getRawMilkController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const query = request.query as RawMilkQuery;
    const tenantId = getRequestTenantId(request);
    const repository = new DrizzleRawMilkCollectionRepository();
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const { data, total } = await repository.findMany({
        donorId: query.donorId,
        triageStatus: query.triageStatus,
        storageStatus: query.storageStatus,
        expired: query.expired,
        collectionDateFrom: query.collectionDateFrom ? new Date(query.collectionDateFrom) : undefined,
        collectionDateTo: query.collectionDateTo ? new Date(query.collectionDateTo) : undefined,
        page,
        limit,
    }, tenantId);

    return reply.send({
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
}

export async function getRawMilkByIdController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const tenantId = getRequestTenantId(request);
    const repository = new DrizzleRawMilkCollectionRepository();
    const data = await repository.findById(id, tenantId);

    if (!data) {
        throw new NotFoundError("Coleta");
    }

    return reply.send({ data });
}

export async function updateRawMilkController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const tenantId = getRequestTenantId(request);
    const body = request.body as UpdateRawMilkBody;
    const payload: UpdateRawMilkBody & {
        collectionDate?: Date;
        receivedAt?: Date;
        expirationDate?: Date;
    } = { ...body };

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
    const data = await repository.update(id, tenantId, payload);

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

    const tenantId = getRequestTenantId(request);
    const repository = new DrizzleRawMilkCollectionRepository();
    const useCase = new TriageRawMilkBatchUseCase(repository);
    const result = await useCase.execute({
        tenantId,
        rawMilkIds,
        status,
        rejectReason,
    });

    return reply.send({ updated: result.length });
}

export async function approveRawMilkController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const tenantId = getRequestTenantId(request);
    const repository = new DrizzleRawMilkCollectionRepository();
    const useCase = new ApproveRawMilkUseCase(repository);
    const data = await useCase.execute(id, tenantId);

    return reply.send({ data });
}

export async function rejectRawMilkController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const { id } = request.params;
    const tenantId = getRequestTenantId(request);
    const { discardReason } = request.body as { discardReason: string };

    const repository = new DrizzleRawMilkCollectionRepository();
    const useCase = new RejectRawMilkUseCase(repository);
    const data = await useCase.execute(id, tenantId, discardReason);

    return reply.send({ data });
}
