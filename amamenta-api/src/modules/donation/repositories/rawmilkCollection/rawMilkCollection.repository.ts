import { RawMilkCollection } from "../../entities/rawMilkCollection.entity";
import { RawMilkTriageStatus } from "../../enums/rawMilkTriageStatus.enum";
import { RawMilkStorageStatus } from "../../enums/rawMilkStorageStatus.enum";

export interface RawMilkCollectionRepository {
    create(data: Omit<RawMilkCollection, "id" | "createdAt" | "updatedAt">): Promise<RawMilkCollection>;
    findById(id: string): Promise<RawMilkCollection | null>;
    findMany(params?: {
        donorId?: string;
        triageStatus?: RawMilkTriageStatus;
        storageStatus?: RawMilkStorageStatus;
        expired?: boolean;
    }): Promise<RawMilkCollection[]>;
    update(id: string, data: Partial<RawMilkCollection>): Promise<RawMilkCollection>;
    updateStatus(id: string, triageStatus?: RawMilkTriageStatus, storageStatus?: RawMilkStorageStatus, rejectReason?: string): Promise<RawMilkCollection>;
}