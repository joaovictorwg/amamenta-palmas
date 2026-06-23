import { RawMilkCollection } from "../../entities/rawMilkCollection.entity";
import { RawMilkTriageStatus } from "../../enums/rawMilkTriageStatus.enum";
import { RawMilkStorageStatus } from "../../enums/rawMilkStorageStatus.enum";

export type CreateRawMilkCollectionData = Omit<
    RawMilkCollection,
    "id" | "tenantId" | "createdAt" | "updatedAt"
>;

export type RawMilkCollectionWithDonor = RawMilkCollection & {
    donorName?: string | null;
};

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
    data: RawMilkCollectionWithDonor[];
    total: number;
}

export interface RawMilkCollectionRepository {
    create(data: CreateRawMilkCollectionData, tenantId: string): Promise<RawMilkCollection>;
    findById(id: string, tenantId: string): Promise<RawMilkCollection | null>;
    findMany(params: RawMilkFindManyParams, tenantId: string): Promise<RawMilkFindManyResult>;
    update(id: string, tenantId: string, data: Partial<RawMilkCollection>): Promise<RawMilkCollection>;
    updateStatus(
        id: string,
        tenantId: string,
        triageStatus?: RawMilkTriageStatus,
        storageStatus?: RawMilkStorageStatus,
        rejectReason?: string,
    ): Promise<RawMilkCollection>;
}
