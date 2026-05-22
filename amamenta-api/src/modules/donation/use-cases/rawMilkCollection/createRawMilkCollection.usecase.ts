import { RawMilkStorageStatus } from "../../enums/rawMilkStorageStatus.enum";
import { RawMilkTriageStatus } from "../../enums/rawMilkTriageStatus.enum";
import { RawMilkCollectionRepository } from "../../repositories/rawmilkCollection/rawMilkCollection.repository";


interface CreateRawMilkCollectionInput {
    donorId: string;
    visitId?: string | null;
    collectionDate: Date;
    receivedAt: Date;
    volumeMl: number;
    createdBy: string;
    observations?: string | null;
}

export class CreateRawMilkCollectionUseCase {
    constructor(private repository: RawMilkCollectionRepository) { }

    async execute(input: CreateRawMilkCollectionInput) {
        // Validação: collection_date não pode ser futura
        if (input.collectionDate > new Date()) {
            throw new Error("Data de coleta não pode ser futura");
        }

        // Calcular validade: collection_date + 15 dias
        const expirationDate = new Date(input.collectionDate);
        expirationDate.setDate(expirationDate.getDate() + 15);

        // Montar objeto
        const data = {
            ...input,
            expirationDate,
            triageStatus: RawMilkTriageStatus.PENDING,
            storageStatus: RawMilkStorageStatus.STORED,
        };

        return this.repository.create(data);
    }
}