import { PasteurizedMilkStockStatus } from "../../enums/pasteurizedMilkStatusStock.enum";
import { PasteurizedMilkUnitRepository } from "../../repositories/pasteurizedMilkUnit/pasteurizedMilkUnit.repository";
import { DistributePasteurizedMilkUseCase } from "./distributePasteurizedMilk.usecase";

const availableUnit = {
    id: "unit-1",
    tenantId: "tenant-1",
    batchId: "batch-1",
    volumeMl: 100,
    expirationDate: new Date(Date.now() + 86400000),
    stockStatus: PasteurizedMilkStockStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe("DistributePasteurizedMilkUseCase", () => {
    it("requires a recipient", async () => {
        const repository = {} as PasteurizedMilkUnitRepository;
        const useCase = new DistributePasteurizedMilkUseCase(repository);

        await expect(useCase.execute({
            id: "unit-1",
            tenantId: "tenant-1",
            recipientIdentifier: " ",
        })).rejects.toThrow("Destinatário é obrigatório");
    });

    it("blocks a duplicate distribution", async () => {
        const repository = {
            findById: jest.fn().mockResolvedValue(availableUnit),
            distribute: jest.fn().mockResolvedValue(null),
        } as unknown as PasteurizedMilkUnitRepository;
        const useCase = new DistributePasteurizedMilkUseCase(repository);

        await expect(useCase.execute({
            id: "unit-1",
            tenantId: "tenant-1",
            recipientIdentifier: "Leito 12",
        })).rejects.toThrow("A unidade não está mais disponível");
    });
});
