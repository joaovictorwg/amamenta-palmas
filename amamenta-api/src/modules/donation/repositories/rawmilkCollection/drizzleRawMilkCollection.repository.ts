import { db } from "@/shared/database/connection";
import { rawMilkCollections } from "@/shared/database/schema/rawMilkCollections.schema";
import { donators } from "@/shared/database/schema/donator.schema";
import { and, count, desc, eq, gt, gte, lte } from "drizzle-orm";
import { NotFoundError } from "@/shared/errors/NotFoundError";
import { RawMilkCollection } from "../../entities/rawMilkCollection.entity";
import {
    CreateRawMilkCollectionData,
    RawMilkCollectionRepository,
    RawMilkFindManyParams,
    RawMilkFindManyResult,
    RawMilkCollectionWithDonor,
} from "./rawMilkCollection.repository";
import { RawMilkTriageStatus } from "../../enums/rawMilkTriageStatus.enum";
import { RawMilkStorageStatus } from "../../enums/rawMilkStorageStatus.enum";

export class DrizzleRawMilkCollectionRepository implements RawMilkCollectionRepository {
    async create(
        data: CreateRawMilkCollectionData,
        tenantId: string,
    ): Promise<RawMilkCollection> {
        const now = new Date();
        const [created] = await db
            .insert(rawMilkCollections)
            .values({ ...data, tenantId, createdAt: now, updatedAt: now })
            .returning();

        if (!created) throw new Error("Failed to create RawMilkCollection");

        return created as RawMilkCollection;
    }

    async findById(
        id: string,
        tenantId: string,
    ): Promise<RawMilkCollection | null> {
        const [found] = await db
            .select()
            .from(rawMilkCollections)
            .where(
                and(
                    eq(rawMilkCollections.id, id),
                    eq(rawMilkCollections.tenantId, tenantId),
                ),
            );

        return (found as RawMilkCollection | undefined) ?? null;
    }

    async findMany(
        params: RawMilkFindManyParams = {},
        tenantId: string,
    ): Promise<RawMilkFindManyResult> {
        const conditions = [eq(rawMilkCollections.tenantId, tenantId)];

        if (params.donorId) {
            conditions.push(eq(rawMilkCollections.donorId, params.donorId));
        }

        if (params.triageStatus !== undefined) {
            conditions.push(eq(rawMilkCollections.triageStatus, params.triageStatus));
        }

        if (params.storageStatus !== undefined) {
            conditions.push(eq(rawMilkCollections.storageStatus, params.storageStatus));
        }

        if (params.expired !== undefined) {
            conditions.push(
                params.expired
                    ? lte(rawMilkCollections.expirationDate, new Date())
                    : gt(rawMilkCollections.expirationDate, new Date()),
            );
        }

        if (params.collectionDateFrom) {
            conditions.push(gte(rawMilkCollections.collectionDate, params.collectionDateFrom));
        }

        if (params.collectionDateTo) {
            conditions.push(lte(rawMilkCollections.collectionDate, params.collectionDateTo));
        }

        const whereClause = and(...conditions);
        const page = params.page ?? 1;
        const limit = params.limit ?? 10;
        const offset = (page - 1) * limit;

        const [data, totalResult] = await Promise.all([
            db
                .select({
                    id: rawMilkCollections.id,
                    tenantId: rawMilkCollections.tenantId,
                    donorId: rawMilkCollections.donorId,
                    donorName: donators.name,
                    visitId: rawMilkCollections.visitId,
                    collectionDate: rawMilkCollections.collectionDate,
                    receivedAt: rawMilkCollections.receivedAt,
                    volumeMl: rawMilkCollections.volumeMl,
                    expirationDate: rawMilkCollections.expirationDate,
                    triageStatus: rawMilkCollections.triageStatus,
                    storageStatus: rawMilkCollections.storageStatus,
                    discardReason: rawMilkCollections.discardReason,
                    observations: rawMilkCollections.observations,
                    createdBy: rawMilkCollections.createdBy,
                    createdAt: rawMilkCollections.createdAt,
                    updatedAt: rawMilkCollections.updatedAt,
                })
                .from(rawMilkCollections)
                .leftJoin(
                    donators,
                    and(
                        eq(donators.id, rawMilkCollections.donorId),
                        eq(donators.tenantId, rawMilkCollections.tenantId),
                    ),
                )
                .where(whereClause)
                .orderBy(desc(rawMilkCollections.createdAt))
                .limit(limit)
                .offset(offset),
            db
                .select({ count: count() })
                .from(rawMilkCollections)
                .where(whereClause),
        ]);

        return {
            data: data as RawMilkCollectionWithDonor[],
            total: Number(totalResult[0]?.count ?? 0),
        };
    }

    async update(
        id: string,
        tenantId: string,
        data: Partial<RawMilkCollection>,
    ): Promise<RawMilkCollection> {
        const [updated] = await db
            .update(rawMilkCollections)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(rawMilkCollections.id, id), eq(rawMilkCollections.tenantId, tenantId)))
            .returning();

        if (!updated) throw new NotFoundError("Coleta");

        return updated as RawMilkCollection;
    }

    async updateStatus(
        id: string,
        tenantId: string,
        triageStatus?: RawMilkTriageStatus,
        storageStatus?: RawMilkStorageStatus,
        rejectReason?: string,
    ): Promise<RawMilkCollection> {
        const updateData: Partial<RawMilkCollection> = { updatedAt: new Date() };

        if (triageStatus !== undefined) updateData.triageStatus = triageStatus;
        if (storageStatus !== undefined) updateData.storageStatus = storageStatus;
        if (rejectReason !== undefined) updateData.discardReason = rejectReason;

        const [updated] = await db
            .update(rawMilkCollections)
            .set(updateData)
            .where(and(eq(rawMilkCollections.id, id), eq(rawMilkCollections.tenantId, tenantId)))
            .returning();

        if (!updated) throw new NotFoundError("Coleta");

        return updated as RawMilkCollection;
    }
}
