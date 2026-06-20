
import { db } from "@/shared/database/connection";
import { rawMilkCollections } from "@/shared/database/schema/rawMilkCollections.schema";
import { eq, and, lte, gt } from "drizzle-orm";
import { RawMilkCollection } from "../../entities/rawMilkCollection.entity";
import { RawMilkCollectionRepository } from "./rawMilkCollection.repository";
import { RawMilkTriageStatus } from "../../enums/rawMilkTriageStatus.enum";
import { RawMilkStorageStatus } from "../../enums/rawMilkStorageStatus.enum";


export class DrizzleRawMilkCollectionRepository implements RawMilkCollectionRepository {

    async create(data: Omit<RawMilkCollection, "id" | "tenantId" | "createdAt" | "updatedAt">, tenantId: string): Promise<RawMilkCollection> {
        const now = new Date();
        const [created] = await db.insert(rawMilkCollections)
            .values({ ...data, tenantId, createdAt: now, updatedAt: now })
            .returning();
        if (!created) throw new Error("Failed to create RawMilkCollection");
        return created as RawMilkCollection;
    }


    async findById(id: string, tenantId: string): Promise<RawMilkCollection | null> {
        const [found] = await db.select().from(rawMilkCollections).where(and(
            eq(rawMilkCollections.id, id),
            eq(rawMilkCollections.tenantId, tenantId),
        ));
        return (found as RawMilkCollection) || null;
    }

    async findMany(params: {
        donorId?: string;
        triageStatus?: RawMilkTriageStatus;
        storageStatus?: RawMilkStorageStatus;
        expired?: boolean;
    } = {}, tenantId: string): Promise<RawMilkCollection[]> {
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
            if (params.expired) {
                conditions.push(lte(rawMilkCollections.expirationDate, new Date()));
            } else {
                conditions.push(gt(rawMilkCollections.expirationDate, new Date()));
            }
        }
        const query = db
            .select()
            .from(rawMilkCollections)
            .where(conditions.length ? and(...conditions) : undefined);
        return await query as RawMilkCollection[];
    }

    async update(id: string, tenantId: string, data: Partial<RawMilkCollection>): Promise<RawMilkCollection> {
        const [updated] = await db.update(rawMilkCollections)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(rawMilkCollections.id, id), eq(rawMilkCollections.tenantId, tenantId)))
            .returning();
        if (!updated) throw new Error("RawMilkCollection not found");
        return updated as RawMilkCollection;
    }

    async updateStatus(id: string, tenantId: string, triageStatus?: RawMilkTriageStatus, storageStatus?: RawMilkStorageStatus, rejectReason?: string): Promise<RawMilkCollection> {
        const updateData: Partial<RawMilkCollection> = { updatedAt: new Date() };
        if (triageStatus !== undefined) updateData.triageStatus = triageStatus;
        if (storageStatus !== undefined) updateData.storageStatus = storageStatus;
        if (rejectReason !== undefined) updateData.discardReason = rejectReason;
        const [updated] = await db.update(rawMilkCollections)
            .set(updateData)
            .where(and(eq(rawMilkCollections.id, id), eq(rawMilkCollections.tenantId, tenantId)))
            .returning();
        if (!updated) throw new Error("RawMilkCollection not found");
        return updated as RawMilkCollection;
    }
}
