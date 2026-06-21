import { BatchRawMilk } from '../../entities/batchRawMilk.entity';

export interface BatchRawMilkRepository {
    create(data: Omit<BatchRawMilk, 'id'>, tx?: any): Promise<BatchRawMilk>;
    createMany(data: Array<Omit<BatchRawMilk, 'id'>>, tx?: any): Promise<BatchRawMilk[]>;
    findByBatchId(batchId: string, tx?: any): Promise<BatchRawMilk[]>;
    findByRawMilkCollectionId(rawMilkCollectionId: string, tx?: any): Promise<BatchRawMilk | null>;
}
