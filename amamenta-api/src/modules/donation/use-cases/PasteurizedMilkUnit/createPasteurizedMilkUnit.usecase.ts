import { PasteurizedMilkUnitRepository } from "../../repositories/pasteurizedMilkUnit/pasteurizedMilkUnit.repository";
import { PasteurizedMilkStockStatus } from "../../enums/pasteurizedMilkStatusStock.enum";

interface CreatePasteurizedMilkUnitInput {
    batchId: string;
    volumeMl: number;
    pasteurizedAt: Date;
    stockStatus?: PasteurizedMilkStockStatus;
}

export class CreatePasteurizedMilkUnitUseCase {
    constructor(private milkUnitRepository: PasteurizedMilkUnitRepository) { }

    async execute(input: CreatePasteurizedMilkUnitInput) {
        // Calcula validade
        const expirationDate = new Date(input.pasteurizedAt);
        expirationDate.setMonth(expirationDate.getMonth() + 6);

        const milkUnit = await this.milkUnitRepository.create({
            batchId: input.batchId,
            volumeMl: input.volumeMl,
            expirationDate,
            stockStatus: input.stockStatus ?? PasteurizedMilkStockStatus.AVAILABLE,
        });

        return milkUnit;
    }
}
