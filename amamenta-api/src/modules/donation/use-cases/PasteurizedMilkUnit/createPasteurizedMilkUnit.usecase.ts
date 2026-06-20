import { PasteurizedMilkUnitRepository } from "../../repositories/pasteurizedMilkUnit/pasteurizedMilkUnit.repository";
import { PasteurizedMilkStockStatus } from "../../enums/pasteurizedMilkStatusStock.enum";
import { PasteurizationBatchRepository } from "../../repositories/pasteurizedBach/pasteurizedBatch.repository";
import { NotFoundError } from "@/shared/errors/NotFoundError";

interface CreatePasteurizedMilkUnitInput {
    tenantId: string;
    batchId: string;
    volumeMl: number;
    pasteurizedAt: Date;
    stockStatus?: PasteurizedMilkStockStatus;
}

export class CreatePasteurizedMilkUnitUseCase {
    constructor(
        private milkUnitRepository: PasteurizedMilkUnitRepository,
        private batchRepository: PasteurizationBatchRepository,
    ) { }

    async execute(input: CreatePasteurizedMilkUnitInput) {
        const batch = await this.batchRepository.findById(input.batchId, input.tenantId);
        if (!batch) throw new NotFoundError("Lote");

        // Calcula validade
        const expirationDate = new Date(input.pasteurizedAt);
        expirationDate.setMonth(expirationDate.getMonth() + 6);

        const milkUnit = await this.milkUnitRepository.create({
            batchId: input.batchId,
            volumeMl: input.volumeMl,
            expirationDate,
            stockStatus: input.stockStatus ?? PasteurizedMilkStockStatus.AVAILABLE,
        }, input.tenantId);

        return milkUnit;
    }
}
