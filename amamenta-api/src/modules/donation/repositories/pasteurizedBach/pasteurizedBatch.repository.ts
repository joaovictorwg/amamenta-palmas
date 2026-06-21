import { PasteurizationBatch } from "../../entities/pasteurizationBatch.entity";
import { MicrobiologyStatus } from "../../enums/MicrobiologyStatus.enum";

export interface PasteurizationBatchRepository {
    create(data: Omit<PasteurizationBatch, "id" | "createdAt" | "updatedAt">, tx?: any): Promise<PasteurizationBatch>;
    findById(id: string, tx?: any): Promise<PasteurizationBatch | null>;
    findMany(params?: {
        microbiologyStatus?: MicrobiologyStatus;
        operatorId?: string;
    }, tx?: any): Promise<PasteurizationBatch[]>;
    update(id: string, data: Partial<PasteurizationBatch>, tx?: any): Promise<PasteurizationBatch>;
}