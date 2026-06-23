import { PasteurizedMilkStockStatus } from "../enums/pasteurizedMilkStatusStock.enum";

export interface PasteurizedMilkUnit {
    id: string;
    tenantId: string;
    batchId: string;
    volumeMl: number;
    expirationDate: Date;
    stockStatus: "AVAILABLE" | "DISTRIBUTED" | "EXPIRED" | "DISCARDED"

    distributedAt?: Date | null;
    discardReason?: string | null;
    recipientIdentifier?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
