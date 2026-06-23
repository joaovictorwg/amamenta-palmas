
import { db } from "@/shared/database/connection";
import { pasteurizedMilkUnits } from "@/shared/database/schema/pasteurizedMilkUnits.schema";
import { eq, and } from "drizzle-orm";
import { PasteurizedMilkUnit } from "../../entities/pasteurizedMilkUnit.entity";
import { PasteurizedMilkStockStatus } from "../../enums/pasteurizedMilkStatusStock.enum";
import { PasteurizedMilkUnitRepository } from "./pasteurizedMilkUnit.repository";


function mapToPasteurizedMilkUnit(row: any): PasteurizedMilkUnit {
    return {
        id: row.id,
        tenantId: row.tenantId,
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
    async create(data: Omit<PasteurizedMilkUnit, "id" | "tenantId" | "createdAt" | "updatedAt">, tenantId: string, tx?: any): Promise<PasteurizedMilkUnit> {
        const executor = tx ?? db;
        const [unit] = await executor.insert(pasteurizedMilkUnits).values({ ...data, tenantId }).returning();
        return mapToPasteurizedMilkUnit(unit);
    }

    async findById(id: string, tenantId: string, tx?: any): Promise<PasteurizedMilkUnit | null> {
        const executor = tx ?? db;
        const [unit] = await executor.select().from(pasteurizedMilkUnits).where(and(
            eq(pasteurizedMilkUnits.id, id),
            eq(pasteurizedMilkUnits.tenantId, tenantId),
        ));
        return unit ? mapToPasteurizedMilkUnit(unit) : null;
    }

    async findMany(params: { stockStatus?: PasteurizedMilkStockStatus; batchId?: string } = {}, tenantId: string, tx?: any): Promise<PasteurizedMilkUnit[]> {
        const executor = tx ?? db;
        const conditions = [eq(pasteurizedMilkUnits.tenantId, tenantId)];
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

    async updateStatus(id: string, tenantId: string, stockStatus: PasteurizedMilkStockStatus, tx?: any, recipientIdentifier?: string | null): Promise<PasteurizedMilkUnit> {
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
            .where(and(eq(pasteurizedMilkUnits.id, id), eq(pasteurizedMilkUnits.tenantId, tenantId)))
            .returning();
        if (!unit) throw new Error("PasteurizedMilkUnit not found");
        return mapToPasteurizedMilkUnit(unit);
    }

    async update(id: string, tenantId: string, data: Partial<Omit<PasteurizedMilkUnit, "id" | "createdAt" | "updatedAt">>, tx?: any): Promise<PasteurizedMilkUnit> {
        const executor = tx ?? db;
        const [unit] = await executor.update(pasteurizedMilkUnits)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(pasteurizedMilkUnits.id, id), eq(pasteurizedMilkUnits.tenantId, tenantId)))
            .returning();
        if (!unit) throw new Error("PasteurizedMilkUnit not found");
        return mapToPasteurizedMilkUnit(unit);
    }
}
