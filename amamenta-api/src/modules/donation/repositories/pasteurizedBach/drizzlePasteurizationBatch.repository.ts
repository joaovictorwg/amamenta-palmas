
import { db } from "@/shared/database/connection";
import { pasteurizationBatches } from "@/shared/database/schema/pasteurizationBatches.schema";
import { eq, and } from "drizzle-orm";
import { PasteurizationBatch } from "../../entities/pasteurizationBatch.entity";
import { MicrobiologyStatus } from "../../enums/MicrobiologyStatus.enum";
import { PasteurizationBatchRepository } from "./pasteurizedBatch.repository";

export class DrizzlePasteurizationBatchRepository implements PasteurizationBatchRepository {
    async create(data: Omit<PasteurizationBatch, "id" | "tenantId" | "createdAt" | "updatedAt">, tenantId: string, tx?: any): Promise<PasteurizationBatch> {
        const executor = tx ?? db;
        const [created] = await executor.insert(pasteurizationBatches).values({ ...data, tenantId }).returning();
        return created as PasteurizationBatch;
    }

    async findById(id: string, tenantId: string, tx?: any): Promise<PasteurizationBatch | null> {
        const executor = tx ?? db;
        const [batch] = await executor.select().from(pasteurizationBatches).where(and(
            eq(pasteurizationBatches.id, id),
            eq(pasteurizationBatches.tenantId, tenantId),
        ));
        return batch as PasteurizationBatch || null;
    }

    async findMany(params: { microbiologyStatus?: MicrobiologyStatus; operatorId?: string } = {}, tenantId: string, tx?: any): Promise<PasteurizationBatch[]> {
        const executor = tx ?? db;
        const conditions = [eq(pasteurizationBatches.tenantId, tenantId)];
        if (params.microbiologyStatus) {
            conditions.push(eq(pasteurizationBatches.microbiologyStatus, params.microbiologyStatus));
        }
        if (params.operatorId) {
            conditions.push(eq(pasteurizationBatches.operatorId, params.operatorId));
        }
        const query = executor.select().from(pasteurizationBatches).where(conditions.length ? and(...conditions) : undefined);
        return await query as PasteurizationBatch[];
    }

    async update(id: string, tenantId: string, data: Partial<PasteurizationBatch>, tx?: any): Promise<PasteurizationBatch> {
        const executor = tx ?? db;
        const [updated] = await executor.update(pasteurizationBatches)
            .set(data)
            .where(and(eq(pasteurizationBatches.id, id), eq(pasteurizationBatches.tenantId, tenantId)))
            .returning();
        if (!updated) throw new Error("PasteurizationBatch not found");
        return updated as PasteurizationBatch;
    }

    async updateStatus(id: string, tenantId: string, microbiologyStatus: MicrobiologyStatus): Promise<PasteurizationBatch> {
        const [updated] = await db.update(pasteurizationBatches)
            .set({ microbiologyStatus, updatedAt: new Date() })
            .where(and(eq(pasteurizationBatches.id, id), eq(pasteurizationBatches.tenantId, tenantId)))
            .returning();
        if (!updated) throw new Error("PasteurizationBatch not found");
        return updated as PasteurizationBatch;
    }
}
