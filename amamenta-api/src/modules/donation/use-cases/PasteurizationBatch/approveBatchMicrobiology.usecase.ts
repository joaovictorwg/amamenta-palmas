import { db } from "@/shared/database/connection";
import { MicrobiologyStatus } from "../../enums/MicrobiologyStatus.enum";
import { PasteurizedMilkStockStatus } from "../../enums/pasteurizedMilkStatusStock.enum";
import { PasteurizationBatchRepository } from "../../repositories/pasteurizedBach/pasteurizedBatch.repository";
import { PasteurizedMilkUnitRepository } from "../../repositories/pasteurizedMilkUnit/pasteurizedMilkUnit.repository";

interface ApproveBatchMicrobiologyInput {
    tenantId: string;
    batchId: string;
    volumeFinalMl: number;
    generatedUnits: number;
}

export class ApproveBatchMicrobiologyUseCase {
    constructor(
        private batchRepository: PasteurizationBatchRepository,
        private milkUnitRepository: PasteurizedMilkUnitRepository
    ) { }

    async execute(input: ApproveBatchMicrobiologyInput) {
        return await db.transaction(async (tx) => {
            const batch = await this.batchRepository.findById(input.batchId, input.tenantId, tx);
            if (!batch) {
                throw new Error("PasteurizationBatch not found");
            }

            const approvedBatch = await this.batchRepository.update(input.batchId, input.tenantId, {
                microbiologyStatus: MicrobiologyStatus.APPROVED,
            }, tx);

            const expirationDate = new Date(approvedBatch.pasteurizedAt);
            expirationDate.setMonth(expirationDate.getMonth() + 6);

            const baseVolume = Math.floor(input.volumeFinalMl / input.generatedUnits);
            const remainder = input.volumeFinalMl % input.generatedUnits;

            const createdUnits = [];
            for (let index = 0; index < input.generatedUnits; index += 1) {
                const milkUnit = await this.milkUnitRepository.create({
                    batchId: approvedBatch.id,
                    volumeMl: baseVolume + (index < remainder ? 1 : 0),
                    expirationDate,
                    stockStatus: PasteurizedMilkStockStatus.AVAILABLE,
                }, input.tenantId, tx);
                createdUnits.push(milkUnit);
            }

            return { batch: approvedBatch, units: createdUnits };
        });
    }
}
