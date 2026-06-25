import { AppError } from "@/shared/errors/AppError";
import { NotFoundError } from "@/shared/errors/NotFoundError";
import { PasteurizedMilkStockStatus } from "../../enums/pasteurizedMilkStatusStock.enum";
import { PasteurizedMilkUnitRepository } from "../../repositories/pasteurizedMilkUnit/pasteurizedMilkUnit.repository";

interface DistributePasteurizedMilkInput {
    tenantId: string;
    id: string;
    recipientIdentifier: string;
}

export class DistributePasteurizedMilkUseCase {
    constructor(private milkUnitRepository: PasteurizedMilkUnitRepository) {}

    async execute(input: DistributePasteurizedMilkInput) {
        const recipientIdentifier = input.recipientIdentifier.trim();
        if (!recipientIdentifier) throw new AppError("Destinatário é obrigatório");

        const unit = await this.milkUnitRepository.findById(input.id, input.tenantId);
        if (!unit) throw new NotFoundError("Unidade");
        if (
            unit.stockStatus !== PasteurizedMilkStockStatus.AVAILABLE ||
            unit.expirationDate < new Date()
        ) {
            throw new AppError(
                "Distribuição indisponível para unidades descartadas, vencidas ou já distribuídas.",
                409,
            );
        }

        const updated = await this.milkUnitRepository.distribute(
            input.id,
            input.tenantId,
            recipientIdentifier,
        );

        if (!updated) {
            throw new AppError(
                "A unidade não está mais disponível para distribuição.",
                409,
            );
        }

        return updated;
    }
}
