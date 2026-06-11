import { db } from "@/shared/database/connection";
import { MicrobiologyStatus } from "../../enums/MicrobiologyStatus.enum";
import { PasteurizedMilkStockStatus } from "../../enums/pasteurizedMilkStatusStock.enum";
import { PasteurizationBatchRepository } from "../../repositories/pasteurizedBach/pasteurizedBatch.repository";
import { PasteurizedMilkUnitRepository } from "../../repositories/pasteurizedMilkUnit/pasteurizedMilkUnit.repository";

interface ApproveBatchMicrobiologyInput {
    batchId: string;
    volumeFinalMl: number;
    units: Array<{
        volumeMl: number;
    }>;
}

export class ApproveBatchMicrobiologyUseCase {
    constructor(
        private batchRepository: PasteurizationBatchRepository,
        private milkUnitRepository: PasteurizedMilkUnitRepository
    ) { }

    async execute(input: ApproveBatchMicrobiologyInput) {
        return await db.transaction(async (tx) => {
            // Aprova microbiologia do lote
            const batch = await this.batchRepository.update(input.batchId, {
                microbiologyStatus: MicrobiologyStatus.APPROVED,
            }, tx);

            // Cria as unidades pasteurizadas
            const expirationDate = new Date(batch.pasteurizedAt);
            expirationDate.setMonth(expirationDate.getMonth() + 6);

            const createdUnits = [];
            for (const unit of input.units) {
                const milkUnit = await this.milkUnitRepository.create({
                    batchId: batch.id,
                    volumeMl: unit.volumeMl,
                    expirationDate,
                    stockStatus: PasteurizedMilkStockStatus.AVAILABLE,
                }, tx);
                createdUnits.push(milkUnit);
            }

            return { batch, units: createdUnits };
        });
    }
}