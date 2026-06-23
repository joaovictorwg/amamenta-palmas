import {
  FakeDonatorClinicalHistoryRepository,
  FakeDonatorRepository,
} from "../tests/fakeDonatorRepository";
import { CreateDonatorUseCase } from "../useCases/createDonator/createDonator.usecase";

describe("DonatorClinicalHistoryRepository", () => {
  it("should create or update clinical history by donator id", async () => {
    const donatorRepository = new FakeDonatorRepository();
    const clinicalHistoryRepository =
      new FakeDonatorClinicalHistoryRepository(donatorRepository);
    const tenantId = crypto.randomUUID();
    const donator = await new CreateDonatorUseCase(donatorRepository).execute({
      name: "Maria",
      phone: "63999999999",
      address: "Rua A",
      neighborhood: "Centro",
      city: "Palmas",
      state: "TO",
      tenantId,
    });

    const created = await clinicalHistoryRepository.createOrUpdate(
      donator.id,
      tenantId,
      {
        profession: "Professora",
      },
    );
    const updated = await clinicalHistoryRepository.createOrUpdate(
      donator.id,
      tenantId,
      {
        profession: "Enfermeira",
      },
    );

    expect(updated.id).toBe(created.id);
    expect(updated.profession).toBe("Enfermeira");
  });
});
