
import { db } from "@/shared/database/connection";
import { batchRawMilk } from "@/shared/database/schema/batchRawMilk.schema";
import { pasteurizationBatches } from "@/shared/database/schema/pasteurizationBatches.schema";
import { rawMilkCollections } from "@/shared/database/schema/rawMilkCollections.schema";
import { eq, and } from "drizzle-orm";
import { BatchRawMilk } from "../../entities/batchRawMilk.entity";
import { BatchRawMilkRepository } from "./batchRawMilk.repository";

export class DrizzleBatchRawMilkRepository implements BatchRawMilkRepository {
    async create(data: Omit<BatchRawMilk, 'id'>, tenantId: string, tx?: any): Promise<BatchRawMilk> {
        const executor = tx ?? db;
        const [batch] = await executor.select({ id: pasteurizationBatches.id })
            .from(pasteurizationBatches)
            .where(and(eq(pasteurizationBatches.id, data.batchId), eq(pasteurizationBatches.tenantId, tenantId)));
        const [rawMilk] = await executor.select({ id: rawMilkCollections.id })
            .from(rawMilkCollections)
            .where(and(eq(rawMilkCollections.id, data.rawMilkCollectionId), eq(rawMilkCollections.tenantId, tenantId)));
        if (!batch || !rawMilk) throw new Error("BatchRawMilk tenant validation failed");
        const [created] = await executor.insert(batchRawMilk).values(data).returning();
        return created as BatchRawMilk;
    }

    async createMany(data: Array<Omit<BatchRawMilk, 'id'>>, tenantId: string, tx?: any): Promise<BatchRawMilk[]> {
        const executor = tx ?? db;
        for (const item of data) {
            const [batch] = await executor.select({ id: pasteurizationBatches.id })
                .from(pasteurizationBatches)
                .where(and(eq(pasteurizationBatches.id, item.batchId), eq(pasteurizationBatches.tenantId, tenantId)));
            const [rawMilk] = await executor.select({ id: rawMilkCollections.id })
                .from(rawMilkCollections)
                .where(and(eq(rawMilkCollections.id, item.rawMilkCollectionId), eq(rawMilkCollections.tenantId, tenantId)));
            if (!batch || !rawMilk) throw new Error("BatchRawMilk tenant validation failed");
        }
        return (await executor.insert(batchRawMilk).values(data).returning()) as BatchRawMilk[];
    }

    async findByBatchId(batchId: string, tenantId: string, tx?: any): Promise<BatchRawMilk[]> {
        const executor = tx ?? db;
        return (await executor.select({
            batchId: batchRawMilk.batchId,
            rawMilkCollectionId: batchRawMilk.rawMilkCollectionId,
        }).from(batchRawMilk)
            .innerJoin(pasteurizationBatches, eq(batchRawMilk.batchId, pasteurizationBatches.id))
            .where(and(eq(batchRawMilk.batchId, batchId), eq(pasteurizationBatches.tenantId, tenantId)))) as BatchRawMilk[];
    }

    async findByRawMilkCollectionId(rawMilkCollectionId: string, tenantId: string, tx?: any): Promise<BatchRawMilk | null> {
        const executor = tx ?? db;
        const [found] = await executor.select({
            batchId: batchRawMilk.batchId,
            rawMilkCollectionId: batchRawMilk.rawMilkCollectionId,
        }).from(batchRawMilk)
            .innerJoin(rawMilkCollections, eq(batchRawMilk.rawMilkCollectionId, rawMilkCollections.id))
            .where(and(eq(batchRawMilk.rawMilkCollectionId, rawMilkCollectionId), eq(rawMilkCollections.tenantId, tenantId)));
        return (found as BatchRawMilk) || null;
    }
}
