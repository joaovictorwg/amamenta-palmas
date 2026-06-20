import { RawMilkCollectionRepository } from "../../repositories/rawmilkCollection/rawMilkCollection.repository";
import { MicrobiologyStatus } from "../../enums/MicrobiologyStatus.enum";
import { RawMilkTriageStatus } from "../../enums/rawMilkTriageStatus.enum";
import { RawMilkStorageStatus } from "../../enums/rawMilkStorageStatus.enum";
import { PasteurizationBatchRepository } from "../../repositories/pasteurizedBach/pasteurizedBatch.repository";
import { BatchRawMilkRepository } from "../../repositories/batchRawMilk/batchRawMilk.repository";

interface CreatePasteurizationBatchInput {
    tenantId: string;
    batchCode: string;
    pasteurizedAt: Date;
    operatorId: string;
    rawMilkIds: string[];
    observations?: string | null;
}

export class CreatePasteurizationUseBatchCase {
    constructor(
        private batchRepository: PasteurizationBatchRepository,
        private rawMilkRepository: RawMilkCollectionRepository,
        private batchRawMilkRepository: BatchRawMilkRepository
    ) { }

    async execute(input: CreatePasteurizationBatchInput) {
        // Buscar todos os frascos
        const frascos = await Promise.all(
            input.rawMilkIds.map(id => this.rawMilkRepository.findById(id, input.tenantId))
        );

        // Validações
        for (const frasco of frascos) {
            if (!frasco) throw new Error("Frasco não encontrado");
            if (frasco.triageStatus !== RawMilkTriageStatus.APPROVED) throw new Error("Frasco não aprovado");
            if (frasco.storageStatus !== RawMilkStorageStatus.STORED) throw new Error("Frasco não disponível");
            if (frasco.expirationDate < input.pasteurizedAt) throw new Error("Frasco vencido");
        }

        // Criar lote
        const batch = await this.batchRepository.create({
            batchCode: input.batchCode,
            pasteurizedAt: input.pasteurizedAt,
            operatorId: input.operatorId,
            microbiologyStatus: MicrobiologyStatus.PENDING,
            observations: input.observations,
        }, input.tenantId);

        // Vincular frascos ao lote (persistir na batch_raw_milk)
        await this.batchRawMilkRepository.createMany(
            input.rawMilkIds.map(rawMilkCollectionId => ({
                batchId: batch.id,
                rawMilkCollectionId,
            })),
            input.tenantId,
        );

        // Atualizar status dos frascos para USED_IN_BATCH
        await Promise.all(
            input.rawMilkIds.map(id =>
                this.rawMilkRepository.updateStatus(id, input.tenantId, undefined, RawMilkStorageStatus.USED_IN_BATCH)
            )
        );

        return batch;
    }
}
