import { PasteurizedMilkUnitRepository } from "../../repositories/pasteurizedMilkUnit/pasteurizedMilkUnit.repository";
import { PasteurizedMilkStockStatus } from "../../enums/pasteurizedMilkStatusStock.enum";

interface DistributePasteurizedMilkInput {
    tenantId: string;
    id: string;
    recipientIdentifier?: string | null;
}

export class DistributePasteurizedMilkUseCase {
    constructor(private milkUnitRepository: PasteurizedMilkUnitRepository) { }

    async execute(input: DistributePasteurizedMilkInput) {
        // Buscar unidade
        const unit = await this.milkUnitRepository.findById(input.id, input.tenantId);
        if (!unit) throw new Error("Unidade não encontrada");
        if (unit.stockStatus !== PasteurizedMilkStockStatus.AVAILABLE) throw new Error("Unidade não disponível para distribuição");
        if (unit.expirationDate < new Date()) throw new Error("Unidade vencida");

        // Atualizar status, data e recipient_identifier
        const updated = await this.milkUnitRepository.updateStatus(
            input.id,
            input.tenantId,
            PasteurizedMilkStockStatus.DISTRIBUTED,
            undefined,
            input.recipientIdentifier ?? null
        );
        return updated;
    }
}
