import { RawMilkCollection } from "../../entities/rawMilkCollection.entity";
import { RawMilkTriageStatus } from "../../enums/rawMilkTriageStatus.enum";
import { RawMilkStorageStatus } from "../../enums/rawMilkStorageStatus.enum";

export interface RawMilkCollectionRepository {
    create(data: Omit<RawMilkCollection, "id" | "tenantId" | "createdAt" | "updatedAt">, tenantId: string): Promise<RawMilkCollection>;
    findById(id: string, tenantId: string): Promise<RawMilkCollection | null>;
    findMany(params: {
        donorId?: string;
        triageStatus?: RawMilkTriageStatus;
        storageStatus?: RawMilkStorageStatus;
        expired?: boolean;
    }, tenantId: string): Promise<RawMilkCollection[]>;
    update(id: string, tenantId: string, data: Partial<RawMilkCollection>): Promise<RawMilkCollection>;
    updateStatus(id: string, tenantId: string, triageStatus?: RawMilkTriageStatus, storageStatus?: RawMilkStorageStatus, rejectReason?: string): Promise<RawMilkCollection>;
}
