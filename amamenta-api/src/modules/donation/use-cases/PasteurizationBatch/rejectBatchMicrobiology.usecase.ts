import { db } from "@/shared/database/connection";
import { MicrobiologyStatus } from "../../enums/MicrobiologyStatus.enum";
import { PasteurizedMilkStockStatus } from "../../enums/pasteurizedMilkStatusStock.enum";
import { PasteurizationBatchRepository } from "../../repositories/pasteurizedBach/pasteurizedBatch.repository";
import { PasteurizedMilkUnitRepository } from "../../repositories/pasteurizedMilkUnit/pasteurizedMilkUnit.repository";
import { BatchRawMilkRepository } from "../../repositories/batchRawMilk/batchRawMilk.repository";

interface RejectBatchMicrobiologyInput {
    batchId: string;
    units: Array<{
        volumeMl: number;
    }>;
}

export class RejectBatchMicrobiologyUseCase {
    constructor(
        private batchRepository: PasteurizationBatchRepository,
        private milkUnitRepository: PasteurizedMilkUnitRepository,
        private batchRawMilkRepository: BatchRawMilkRepository
    ) { }

    async execute(input: RejectBatchMicrobiologyInput) {
        return await db.transaction(async (tx) => {
            // Atualiza status do lote para REJECTED
            const batch = await this.batchRepository.update(input.batchId, {
                microbiologyStatus: MicrobiologyStatus.REJECTED,
            }, tx);

            // Calcula validade das unidades
            const expirationDate = new Date(batch.pasteurizedAt);
            expirationDate.setMonth(expirationDate.getMonth() + 6);

            // Cria unidades pasteurizadas descartadas
            const createdUnits = [];
            for (const unit of input.units) {
                const milkUnit = await this.milkUnitRepository.create({
                    batchId: batch.id,
                    volumeMl: unit.volumeMl,
                    expirationDate,
                    stockStatus: PasteurizedMilkStockStatus.DISCARDED,
                    discardReason: "Falha na análise microbiológica do lote",
                }, tx);
                createdUnits.push(milkUnit);
            }

            return { batch, units: createdUnits };
        });
    }
}
