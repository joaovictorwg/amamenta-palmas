
import { db } from "@/shared/database/connection";
import { pasteurizedMilkUnits } from "@/shared/database/schema/pasteurizedMilkUnits.schema";
import { eq, and } from "drizzle-orm";
import { PasteurizedMilkUnit } from "../../entities/pasteurizedMilkUnit.entity";
import { PasteurizedMilkStockStatus } from "../../enums/pasteurizedMilkStatusStock.enum";
import { PasteurizedMilkUnitRepository } from "./pasteurizedMilkUnit.repository";


function mapToPasteurizedMilkUnit(row: any): PasteurizedMilkUnit {
    return {
        id: row.id,
        batchId: row.batchId,
        volumeMl: row.volumeMl,
        expirationDate: row.expirationDate,
        stockStatus: row.stockStatus,
        distributedAt: row.distributedAt,
        discardReason: row.discardReason,
        recipientIdentifier: row.recipientIdentifier,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

export class DrizzlePasteurizedMilkUnitRepository implements PasteurizedMilkUnitRepository {
    async create(data: Omit<PasteurizedMilkUnit, "id" | "createdAt" | "updatedAt">, tx?: any): Promise<PasteurizedMilkUnit> {
        const executor = tx ?? db;
        const [unit] = await executor.insert(pasteurizedMilkUnits).values(data).returning();
        return mapToPasteurizedMilkUnit(unit);
    }

    async findById(id: string, tx?: any): Promise<PasteurizedMilkUnit | null> {
        const executor = tx ?? db;
        const [unit] = await executor.select().from(pasteurizedMilkUnits).where(eq(pasteurizedMilkUnits.id, id));
        return unit ? mapToPasteurizedMilkUnit(unit) : null;
    }

    async findMany(params: { stockStatus?: PasteurizedMilkStockStatus; batchId?: string } = {}, tx?: any): Promise<PasteurizedMilkUnit[]> {
        const executor = tx ?? db;
        const conditions = [];
        if (params.stockStatus) {
            conditions.push(eq(pasteurizedMilkUnits.stockStatus, params.stockStatus));
        }
        if (params.batchId) {
            conditions.push(eq(pasteurizedMilkUnits.batchId, params.batchId));
        }
        const query = executor
            .select()
            .from(pasteurizedMilkUnits)
            .where(conditions.length ? and(...conditions) : undefined);
        const result = await query;
        return result.map(mapToPasteurizedMilkUnit);
    }

    async updateStatus(id: string, stockStatus: PasteurizedMilkStockStatus, tx?: any, recipientIdentifier?: string | null): Promise<PasteurizedMilkUnit> {
        const executor = tx ?? db;
        const updateData: any = { stockStatus, updatedAt: new Date() };
        if (stockStatus === PasteurizedMilkStockStatus.DISTRIBUTED) {
            updateData.distributedAt = new Date();
        }
        if (recipientIdentifier !== undefined) {
            updateData.recipientIdentifier = recipientIdentifier;
        }
        const [unit] = await executor.update(pasteurizedMilkUnits)
            .set(updateData)
            .where(eq(pasteurizedMilkUnits.id, id))
            .returning();
        return mapToPasteurizedMilkUnit(unit);
    }

    async update(id: string, data: Partial<Omit<PasteurizedMilkUnit, "id" | "createdAt" | "updatedAt">>, tx?: any): Promise<PasteurizedMilkUnit> {
        const executor = tx ?? db;
        const [unit] = await executor.update(pasteurizedMilkUnits)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(pasteurizedMilkUnits.id, id))
            .returning();
        if (!unit) throw new Error("PasteurizedMilkUnit not found");
        return mapToPasteurizedMilkUnit(unit);
    }
}
