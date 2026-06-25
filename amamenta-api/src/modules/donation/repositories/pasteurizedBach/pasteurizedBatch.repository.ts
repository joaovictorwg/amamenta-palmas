import { PasteurizationBatch } from "../../entities/pasteurizationBatch.entity";
import { MicrobiologyStatus } from "../../enums/MicrobiologyStatus.enum";

export interface PasteurizationBatchRepository {
    create(data: Omit<PasteurizationBatch, "id" | "tenantId" | "createdAt" | "updatedAt">, tenantId: string, tx?: any): Promise<PasteurizationBatch>;
    findById(id: string, tenantId: string, tx?: any): Promise<PasteurizationBatch | null>;
    findMany(params: {
        microbiologyStatus?: MicrobiologyStatus;
        operatorId?: string;
    }, tenantId: string, tx?: any): Promise<PasteurizationBatch[]>;
    resolvePending(id: string, tenantId: string, status: MicrobiologyStatus, tx?: any): Promise<PasteurizationBatch | null>;
    update(id: string, tenantId: string, data: Partial<PasteurizationBatch>, tx?: any): Promise<PasteurizationBatch>;
    updateStatus(id: string, tenantId: string, microbiologyStatus: MicrobiologyStatus): Promise<PasteurizationBatch>;
}
