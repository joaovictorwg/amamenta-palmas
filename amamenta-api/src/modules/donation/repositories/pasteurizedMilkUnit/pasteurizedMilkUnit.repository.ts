import { PasteurizedMilkUnit } from "../../entities/pasteurizedMilkUnit.entity";
import { PasteurizedMilkStockStatus } from "../../enums/pasteurizedMilkStatusStock.enum";

export interface PasteurizedMilkUnitRepository {
    create(data: Omit<PasteurizedMilkUnit, "id" | "tenantId" | "createdAt" | "updatedAt">, tenantId: string, tx?: any): Promise<PasteurizedMilkUnit>;
    findById(id: string, tenantId: string, tx?: any): Promise<PasteurizedMilkUnit | null>;
    findMany(params: {
        stockStatus?: PasteurizedMilkStockStatus;
        batchId?: string;
    }, tenantId: string, tx?: any): Promise<PasteurizedMilkUnit[]>;
    updateStatus(id: string, tenantId: string, stockStatus: PasteurizedMilkStockStatus, tx?: any, recipientIdentifier?: string | null): Promise<PasteurizedMilkUnit>;
    update(id: string, tenantId: string, data: Partial<Omit<PasteurizedMilkUnit, "id" | "createdAt" | "updatedAt">>, tx?: any): Promise<PasteurizedMilkUnit>;
}
