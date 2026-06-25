
import { db } from "@/shared/database/connection";
import { pasteurizationBatches, pasteurizedMilkUnits } from "@/shared/database/schema";
import { and, asc, count, eq, gte, lt, or } from "drizzle-orm";
import { PasteurizedMilkUnit } from "../../entities/pasteurizedMilkUnit.entity";
import { PasteurizedMilkStockStatus } from "../../enums/pasteurizedMilkStatusStock.enum";
import { PasteurizedMilkUnitRepository } from "./pasteurizedMilkUnit.repository";


function mapToPasteurizedMilkUnit(row: any): PasteurizedMilkUnit {
    return {
        id: row.id,
        tenantId: row.tenantId,
        batchId: row.batchId,
        batchCode: row.batchCode ?? null,
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

    async findMany(params: {
        stockStatus?: PasteurizedMilkStockStatus;
        batchId?: string;
        page?: number;
        limit?: number;
    } = {}, tenantId: string, tx?: any): Promise<{ data: PasteurizedMilkUnit[]; total: number }> {
        const executor = tx ?? db;
        const now = new Date();
        const conditions = [eq(pasteurizedMilkUnits.tenantId, tenantId)];
        if (params.stockStatus === PasteurizedMilkStockStatus.AVAILABLE) {
            conditions.push(and(
                eq(pasteurizedMilkUnits.stockStatus, PasteurizedMilkStockStatus.AVAILABLE),
                gte(pasteurizedMilkUnits.expirationDate, now),
            )!);
        } else if (params.stockStatus === PasteurizedMilkStockStatus.EXPIRED) {
            conditions.push(or(
                eq(pasteurizedMilkUnits.stockStatus, PasteurizedMilkStockStatus.EXPIRED),
                and(
                    eq(pasteurizedMilkUnits.stockStatus, PasteurizedMilkStockStatus.AVAILABLE),
                    lt(pasteurizedMilkUnits.expirationDate, now),
                ),
            )!);
        } else if (params.stockStatus) {
            conditions.push(eq(pasteurizedMilkUnits.stockStatus, params.stockStatus));
        }
        if (params.batchId) {
            conditions.push(eq(pasteurizedMilkUnits.batchId, params.batchId));
        }
        const whereClause = and(...conditions);
        const page = params.page ?? 1;
        const limit = params.limit ?? 10;
        const [result, totalResult] = await Promise.all([
            executor
                .select({
                    id: pasteurizedMilkUnits.id,
                    tenantId: pasteurizedMilkUnits.tenantId,
                    batchId: pasteurizedMilkUnits.batchId,
                    batchCode: pasteurizationBatches.batchCode,
                    volumeMl: pasteurizedMilkUnits.volumeMl,
                    expirationDate: pasteurizedMilkUnits.expirationDate,
                    stockStatus: pasteurizedMilkUnits.stockStatus,
                    distributedAt: pasteurizedMilkUnits.distributedAt,
                    discardReason: pasteurizedMilkUnits.discardReason,
                    recipientIdentifier: pasteurizedMilkUnits.recipientIdentifier,
                    createdAt: pasteurizedMilkUnits.createdAt,
                    updatedAt: pasteurizedMilkUnits.updatedAt,
                })
                .from(pasteurizedMilkUnits)
                .leftJoin(
                    pasteurizationBatches,
                    and(
                        eq(pasteurizationBatches.id, pasteurizedMilkUnits.batchId),
                        eq(pasteurizationBatches.tenantId, pasteurizedMilkUnits.tenantId),
                    ),
                )
                .where(whereClause)
                .orderBy(asc(pasteurizedMilkUnits.expirationDate))
                .limit(limit)
                .offset((page - 1) * limit),
            executor.select({ count: count() }).from(pasteurizedMilkUnits).where(whereClause),
        ]);

        return {
            data: result.map((row: any) => mapToPasteurizedMilkUnit({
                ...row,
                stockStatus:
                    row.stockStatus === PasteurizedMilkStockStatus.AVAILABLE &&
                    row.expirationDate < now
                        ? PasteurizedMilkStockStatus.EXPIRED
                        : row.stockStatus,
            })),
            total: Number(totalResult[0]?.count ?? 0),
        };
    }

    async distribute(id: string, tenantId: string, recipientIdentifier: string, tx?: any): Promise<PasteurizedMilkUnit | null> {
        const executor = tx ?? db;
        const [unit] = await executor
            .update(pasteurizedMilkUnits)
            .set({
                stockStatus: PasteurizedMilkStockStatus.DISTRIBUTED,
                recipientIdentifier,
                distributedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(and(
                eq(pasteurizedMilkUnits.id, id),
                eq(pasteurizedMilkUnits.tenantId, tenantId),
                eq(pasteurizedMilkUnits.stockStatus, PasteurizedMilkStockStatus.AVAILABLE),
                gte(pasteurizedMilkUnits.expirationDate, new Date()),
            ))
            .returning();

        return unit ? mapToPasteurizedMilkUnit(unit) : null;
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
