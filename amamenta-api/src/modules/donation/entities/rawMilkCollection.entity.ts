import { RawMilkTriageStatus } from "../enums/rawMilkTriageStatus.enum";
import { RawMilkStorageStatus } from "../enums/rawMilkStorageStatus.enum";

export interface RawMilkCollection {
    id: string;
    donorId: string;
    visitId?: string | null;
    collectionDate: Date;
    receivedAt: Date;
    volumeMl: number;
    expirationDate: Date;
    triageStatus: "PENDING" | "APPROVED" | "REJECTED";
    storageStatus: "STORED" | "WAITING_BATCH" | "USED_IN_BATCH" | "EXPIRED" | "DISCARDED";
    discardReason?: string | null;
    observations?: string | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}