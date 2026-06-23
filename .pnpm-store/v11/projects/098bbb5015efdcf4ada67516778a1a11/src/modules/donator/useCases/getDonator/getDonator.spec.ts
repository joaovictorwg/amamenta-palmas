import { NotFoundError } from "@/shared/errors/NotFoundError";
import { FakeDonatorRepository } from "../../tests/fakeDonatorRepository";
import { CreateDonatorUseCase } from "../createDonator/createDonator.usecase";
import { GetDonatorByIdUseCase } from "./getDonator.usecase";

describe("GetDonatorByIdUseCase", () => {
  it("should return the donator profile", async () => {
    const repository = new FakeDonatorRepository();
    const tenantId = crypto.randomUUID();
    const created = await new CreateDonatorUseCase(repository).execute({
      name: "Maria",
      phone: "63999999999",
      address: "Rua A",
      neighborhood: "Centro",
      city: "Palmas",
      state: "TO",
      tenantId,
    });

    const result = await new GetDonatorByIdUseCase(repository).execute(
      created.id,
      tenantId,
    );

    expect(result.id).toBe(created.id);
    expect(result.clinicalHistory).toBeNull();
    expect(result.latestExam).toBeNull();
  });

  it("should throw when donator does not exist", async () => {
    const repository = new FakeDonatorRepository();
    const tenantId = crypto.randomUUID();

    await expect(
      new GetDonatorByIdUseCase(repository).execute(
        crypto.randomUUID(),
        tenantId,
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
