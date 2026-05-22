import { RawMilkCollectionRepository } from "../../repositories/rawmilkCollection/rawMilkCollection.repository";
import { RawMilkTriageStatus } from "../../enums/rawMilkTriageStatus.enum";

export class RejectRawMilkUseCase {
    constructor(private repository: RawMilkCollectionRepository) { }

    async execute(id: string, discardReason: string) {
        // Rejeita triagem (PENDING -> REJECTED) e registra motivo
        return this.repository.update(id, {
            triageStatus: RawMilkTriageStatus.REJECTED,
            discardReason,
        });
    }
}