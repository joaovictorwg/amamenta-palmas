export type TriageStatus = "PENDING" | "APPROVED" | "REJECTED";
export type StorageStatus = "STORED" | "WAITING_BATCH" | "USED_IN_BATCH" | "EXPIRED" | "DISCARDED";

export type RawMilkCollection = {
    id: string;
    donorId: string;
    donorName?: string | null;
    volumeMl: number;
    collectionDate: string;
    receivedAt: string;
    expirationDate: string;
    triageStatus: TriageStatus;
    storageStatus: StorageStatus;
    discardReason?: string | null;
    observations?: string | null;
    createdBy: string;
};

export type RawMilkResponse = {
    data: RawMilkCollection[];
    meta: { page: number; limit: number; total: number; totalPages: number };
};

export type RawMilkFilterTab = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";