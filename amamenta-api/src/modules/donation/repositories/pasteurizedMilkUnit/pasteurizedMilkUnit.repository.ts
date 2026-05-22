import { PasteurizedMilkUnit } from "../../entities/pasteurizedMilkUnit.entity";
import { PasteurizedMilkStockStatus } from "../../enums/pasteurizedMilkStatusStock.enum";

export interface PasteurizedMilkUnitRepository {
    create(data: Omit<PasteurizedMilkUnit, "id" | "createdAt" | "updatedAt">, tx?: any): Promise<PasteurizedMilkUnit>;
    findById(id: string, tx?: any): Promise<PasteurizedMilkUnit | null>;
    findMany(params?: {
        stockStatus?: PasteurizedMilkStockStatus;
        batchId?: string;
    }, tx?: any): Promise<PasteurizedMilkUnit[]>;
    updateStatus(id: string, stockStatus: PasteurizedMilkStockStatus, tx?: any, recipientIdentifier?: string | null): Promise<PasteurizedMilkUnit>;
    update(id: string, data: Partial<Omit<PasteurizedMilkUnit, "id" | "createdAt" | "updatedAt">>, tx?: any): Promise<PasteurizedMilkUnit>;
}