import { RawMilkCollectionRepository } from "../../repositories/rawmilkCollection/rawMilkCollection.repository";
import { RawMilkTriageStatus } from "../../enums/rawMilkTriageStatus.enum";

export class ApproveRawMilkUseCase {
    constructor(private repository: RawMilkCollectionRepository) { }

    async execute(id: string) {
        // Aprova triagem (PENDING -> APPROVED)
        return this.repository.updateStatus(id, RawMilkTriageStatus.APPROVED);
    }
}