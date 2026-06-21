import { DonatorStatus } from "@/modules/donator/enums/donatorStatus.enum";
import {
    DonatorExamsRepository,
    DonatorRepository,
} from "@/modules/donator/repositories/donator.repository";
import { BadRequestError } from "@/shared/errors/BadRequestError";
import { NotFoundError } from "@/shared/errors/NotFoundError";
import { RawMilkStorageStatus } from "../../enums/rawMilkStorageStatus.enum";
import { RawMilkTriageStatus } from "../../enums/rawMilkTriageStatus.enum";
import { RawMilkCollectionRepository } from "../../repositories/rawmilkCollection/rawMilkCollection.repository";

interface CreateRawMilkCollectionInput {
    tenantId: string;
    donorId: string;
    visitId?: string | null;
    collectionDate: Date;
    receivedAt: Date;
    volumeMl: number;
    createdBy: string;
    observations?: string | null;
}

export class CreateRawMilkCollectionUseCase {
    constructor(
        private repository: RawMilkCollectionRepository,
        private donatorRepository?: DonatorRepository,
        private donatorExamsRepository?: DonatorExamsRepository,
    ) { }

    async execute(input: CreateRawMilkCollectionInput) {
        if (input.collectionDate > new Date()) {
            throw new BadRequestError("Data de coleta nao pode ser futura");
        }

        if (this.donatorRepository && this.donatorExamsRepository) {
            const donator = await this.donatorRepository.findById(
                input.donorId,
                input.tenantId,
            );

            if (!donator) {
                throw new NotFoundError("Doadora");
            }

            if (donator.status !== DonatorStatus.ACTIVE) {
                throw new BadRequestError("Doadora nao liberada para coleta");
            }

            const latestExam =
                await this.donatorExamsRepository.findLatestByDonatorId(
                    input.donorId,
                    input.tenantId,
                );

            if (!latestExam || latestExam.validUntil < input.receivedAt) {
                throw new BadRequestError("Exames da doadora vencidos");
            }
        }

        const expirationDate = new Date(input.collectionDate);
        expirationDate.setDate(expirationDate.getDate() + 15);

        if (input.receivedAt > expirationDate) {
            throw new BadRequestError(
                "Frasco recebido após prazo permitido para armazenamento domiciliar.",
            );
        }

        const rawMilk = await this.repository.create({
            ...input,
            expirationDate,
            triageStatus: RawMilkTriageStatus.PENDING,
            storageStatus: RawMilkStorageStatus.STORED,
        });

        if (this.donatorRepository) {
            await this.donatorRepository.updateLastCollectionDate(
                input.donorId,
                input.tenantId,
                input.collectionDate,
            );
        }

        return rawMilk;
    }
}
