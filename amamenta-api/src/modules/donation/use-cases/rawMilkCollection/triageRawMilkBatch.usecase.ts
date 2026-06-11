import { RawMilkCollectionRepository } from "../../repositories/rawmilkCollection/rawMilkCollection.repository";
import { RawMilkTriageStatus } from "../../enums/rawMilkTriageStatus.enum";

interface TriageRawMilkBatchInput {
    rawMilkIds: string[];
    status: RawMilkTriageStatus;
    rejectReason?: string;
}

export class TriageRawMilkBatchUseCase {
    constructor(private rawMilkRepository: RawMilkCollectionRepository) { }

    async execute(input: TriageRawMilkBatchInput) {
        const results = await Promise.all(
            input.rawMilkIds.map(id =>
                this.rawMilkRepository.updateStatus(
                    id,
                    input.status,
                    undefined,
                    input.status === RawMilkTriageStatus.REJECTED ? input.rejectReason : undefined
                )
            )
        );
        return results;
    }
}
