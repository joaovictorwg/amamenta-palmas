import { MicrobiologyStatus } from "../enums/MicrobiologyStatus.enum";

export interface PasteurizationBatch {
    id: string;
    tenantId: string;
    batchCode: string;
    pasteurizedAt: Date;
    operatorId: string;
    microbiologyStatus: "PENDING" | "APPROVED" | "REJECTED";
    observations?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
