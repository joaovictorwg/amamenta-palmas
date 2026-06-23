import { BatchRawMilk } from '../../entities/batchRawMilk.entity';

export interface BatchRawMilkRepository {
    create(data: Omit<BatchRawMilk, 'id'>, tenantId: string, tx?: any): Promise<BatchRawMilk>;
    createMany(data: Array<Omit<BatchRawMilk, 'id'>>, tenantId: string, tx?: any): Promise<BatchRawMilk[]>;
    findByBatchId(batchId: string, tenantId: string, tx?: any): Promise<BatchRawMilk[]>;
    findByRawMilkCollectionId(rawMilkCollectionId: string, tenantId: string, tx?: any): Promise<BatchRawMilk | null>;
}
