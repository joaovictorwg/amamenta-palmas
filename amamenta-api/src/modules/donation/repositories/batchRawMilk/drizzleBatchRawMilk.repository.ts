
import { db } from "@/shared/database/connection";
import { batchRawMilk } from "@/shared/database/schema/batchRawMilk.schema";
import { eq, and } from "drizzle-orm";
import { BatchRawMilk } from "../../entities/batchRawMilk.entity";
import { BatchRawMilkRepository } from "./batchRawMilk.repository";

export class DrizzleBatchRawMilkRepository implements BatchRawMilkRepository {
    async create(data: Omit<BatchRawMilk, 'id'>, tx?: any): Promise<BatchRawMilk> {
        const executor = tx ?? db;
        const [created] = await executor.insert(batchRawMilk).values(data).returning();
        return created as BatchRawMilk;
    }

    async createMany(data: Array<Omit<BatchRawMilk, 'id'>>, tx?: any): Promise<BatchRawMilk[]> {
        const executor = tx ?? db;
        return (await executor.insert(batchRawMilk).values(data).returning()) as BatchRawMilk[];
    }

    async findByBatchId(batchId: string, tx?: any): Promise<BatchRawMilk[]> {
        const executor = tx ?? db;
        return (await executor.select().from(batchRawMilk).where(eq(batchRawMilk.batchId, batchId))) as BatchRawMilk[];
    }

    async findByRawMilkCollectionId(rawMilkCollectionId: string, tx?: any): Promise<BatchRawMilk | null> {
        const executor = tx ?? db;
        const [found] = await executor.select().from(batchRawMilk).where(eq(batchRawMilk.rawMilkCollectionId, rawMilkCollectionId));
        return (found as BatchRawMilk) || null;
    }
}
