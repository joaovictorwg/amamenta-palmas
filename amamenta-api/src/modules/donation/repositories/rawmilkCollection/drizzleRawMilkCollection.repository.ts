import { db } from "@/shared/database/connection";
import { rawMilkCollections } from "@/shared/database/schema/rawMilkCollections.schema";
import { donators } from "@/shared/database/schema/donator.schema";
import { eq, and, lte, gt, gte, sql } from "drizzle-orm";
import { RawMilkCollection } from "../../entities/rawMilkCollection.entity";
import {
    RawMilkCollectionRepository,
    RawMilkFindManyParams,
    RawMilkFindManyResult,
} from "./rawMilkCollection.repository";
import { RawMilkTriageStatus } from "../../enums/rawMilkTriageStatus.enum";
import { RawMilkStorageStatus } from "../../enums/rawMilkStorageStatus.enum";

export class DrizzleRawMilkCollectionRepository implements RawMilkCollectionRepository {

    async create(data: Omit<RawMilkCollection, "id" | "createdAt" | "updatedAt">): Promise<RawMilkCollection> {
        const now = new Date();
        const [created] = await db.insert(rawMilkCollections)
            .values({ ...data, createdAt: now, updatedAt: now })
            .returning();
        if (!created) throw new Error("Failed to create RawMilkCollection");
        return created as RawMilkCollection;
    }

    async findById(id: string): Promise<RawMilkCollection | null> {
        const [found] = await db.select().from(rawMilkCollections).where(eq(rawMilkCollections.id, id));
        return (found as RawMilkCollection) || null;
    }

    async findMany(params: RawMilkFindManyParams = {}): Promise<RawMilkFindManyResult> {
        const conditions = [];
        if (params.donorId) conditions.push(eq(rawMilkCollections.donorId, params.donorId));
        if (params.triageStatus !== undefined) conditions.push(eq(rawMilkCollections.triageStatus, params.triageStatus));
        if (params.storageStatus !== undefined) conditions.push(eq(rawMilkCollections.storageStatus, params.storageStatus));
        if (params.expired !== undefined) {
            conditions.push(
                params.expired
                    ? lte(rawMilkCollections.expirationDate, new Date())
                    : gt(rawMilkCollections.expirationDate, new Date()),
            );
        }
        if (params.collectionDateFrom) conditions.push(gte(rawMilkCollections.collectionDate, params.collectionDateFrom));
        if (params.collectionDateTo) conditions.push(lte(rawMilkCollections.collectionDate, params.collectionDateTo));

        const where = conditions.length ? and(...conditions) : undefined;
        const page = params.page ?? 1;
        const limit = params.limit ?? 10;
        const offset = (page - 1) * limit;

        const [data, totalResult] = await Promise.all([
            db
                .select({
                    id: rawMilkCollections.id,
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
                .leftJoin(donators, eq(donators.id, rawMilkCollections.donorId))
                .where(where)
                .orderBy(sql`${rawMilkCollections.createdAt} desc`)
                .limit(limit)
                .offset(offset),
            db.select({ count: sql<number>`count(*)` }).from(rawMilkCollections).where(where),
        ]);

        return {
            data: data as (RawMilkCollection & { donorName?: string | null })[],
            total: Number(totalResult[0]?.count ?? 0),
        };
    }

    async update(id: string, data: Partial<RawMilkCollection>): Promise<RawMilkCollection> {
        const [updated] = await db.update(rawMilkCollections)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(rawMilkCollections.id, id))
            .returning();
        if (!updated) throw new Error("RawMilkCollection not found");
        return updated as RawMilkCollection;
    }

    async updateStatus(id: string, triageStatus?: RawMilkTriageStatus, storageStatus?: RawMilkStorageStatus, rejectReason?: string): Promise<RawMilkCollection> {
        const updateData: Partial<RawMilkCollection> = { updatedAt: new Date() };
        if (triageStatus !== undefined) updateData.triageStatus = triageStatus;
        if (storageStatus !== undefined) updateData.storageStatus = storageStatus;
        if (rejectReason !== undefined) updateData.discardReason = rejectReason;
        const [updated] = await db.update(rawMilkCollections)
            .set(updateData)
            .where(eq(rawMilkCollections.id, id))
            .returning();
        if (!updated) throw new Error("RawMilkCollection not found");
        return updated as RawMilkCollection;
    }
}