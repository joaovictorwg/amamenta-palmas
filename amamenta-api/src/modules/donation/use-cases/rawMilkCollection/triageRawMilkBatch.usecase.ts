import { RawMilkCollectionRepository } from "../../repositories/rawmilkCollection/rawMilkCollection.repository";
import { RawMilkTriageStatus } from "../../enums/rawMilkTriageStatus.enum";

interface TriageRawMilkBatchInput {
    tenantId: string;
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
                    input.tenantId,
                    input.status,
                    undefined,
                    input.status === RawMilkTriageStatus.REJECTED ? input.rejectReason : undefined
                )
            )
        );
        return results;
    }
}
