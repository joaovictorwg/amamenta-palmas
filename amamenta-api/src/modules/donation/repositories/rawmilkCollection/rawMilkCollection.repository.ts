import { RawMilkCollection } from "../../entities/rawMilkCollection.entity";
import { RawMilkTriageStatus } from "../../enums/rawMilkTriageStatus.enum";
import { RawMilkStorageStatus } from "../../enums/rawMilkStorageStatus.enum";

export interface RawMilkFindManyParams {
    donorId?: string;
    triageStatus?: RawMilkTriageStatus;
    storageStatus?: RawMilkStorageStatus;
    expired?: boolean;
    collectionDateFrom?: Date;
    collectionDateTo?: Date;
    page?: number;
    limit?: number;
}

export interface RawMilkFindManyResult {
    data: (RawMilkCollection & { donorName?: string | null })[];
    total: number;
}

export interface RawMilkCollectionRepository {
    create(data: Omit<RawMilkCollection, "id" | "createdAt" | "updatedAt">): Promise<RawMilkCollection>;
    findById(id: string): Promise<RawMilkCollection | null>;
    findMany(params?: RawMilkFindManyParams): Promise<RawMilkFindManyResult>;
    update(id: string, data: Partial<RawMilkCollection>): Promise<RawMilkCollection>;
    updateStatus(id: string, triageStatus?: RawMilkTriageStatus, storageStatus?: RawMilkStorageStatus, rejectReason?: string): Promise<RawMilkCollection>;
}