import { db } from "@/shared/database/connection";
import { rawMilkCollections } from "@/shared/database/schema/rawMilkCollections.schema";
import { and, eq } from "drizzle-orm";
import { MicrobiologyStatus } from "../../enums/MicrobiologyStatus.enum";
import { PasteurizedMilkStockStatus } from "../../enums/pasteurizedMilkStatusStock.enum";
import { PasteurizationBatchRepository } from "../../repositories/pasteurizedBach/pasteurizedBatch.repository";
import { PasteurizedMilkUnitRepository } from "../../repositories/pasteurizedMilkUnit/pasteurizedMilkUnit.repository";
import { BatchRawMilkRepository } from "../../repositories/batchRawMilk/batchRawMilk.repository";

interface RejectBatchMicrobiologyInput {
    tenantId: string;
    batchId: string;
    reason: string;
}

export class RejectBatchMicrobiologyUseCase {
    constructor(
        private batchRepository: PasteurizationBatchRepository,
        private milkUnitRepository: PasteurizedMilkUnitRepository,
        private batchRawMilkRepository: BatchRawMilkRepository,
    ) { }

    async execute(input: RejectBatchMicrobiologyInput) {
        return await db.transaction(async (tx) => {
            const batch = await this.batchRepository.findById(input.batchId, input.tenantId, tx);
            if (!batch) {
                throw new Error("PasteurizationBatch not found");
            }

            const rejectedBatch = await this.batchRepository.update(input.batchId, input.tenantId, {
                microbiologyStatus: MicrobiologyStatus.REJECTED,
            }, tx);

            const expirationDate = new Date(rejectedBatch.pasteurizedAt);
            expirationDate.setMonth(expirationDate.getMonth() + 6);

            const relations = await this.batchRawMilkRepository.findByBatchId(rejectedBatch.id, input.tenantId, tx);
            const createdUnits = [];

            for (const relation of relations) {
                const [rawMilk] = await tx.select({ volumeMl: rawMilkCollections.volumeMl })
                    .from(rawMilkCollections)
                    .where(and(
                        eq(rawMilkCollections.id, relation.rawMilkCollectionId),
                        eq(rawMilkCollections.tenantId, input.tenantId),
                    ));

                if (!rawMilk) {
                    throw new Error("RawMilkCollection not found");
                }

                const milkUnit = await this.milkUnitRepository.create({
                    batchId: rejectedBatch.id,
                    volumeMl: rawMilk.volumeMl,
                    expirationDate,
                    stockStatus: PasteurizedMilkStockStatus.DISCARDED,
                    discardReason: input.reason,
                }, input.tenantId, tx);
                createdUnits.push(milkUnit);
            }

            return { batch: rejectedBatch, units: createdUnits };
        });
    }
}
