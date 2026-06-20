import { NotFoundError } from "@/shared/errors/NotFoundError";
import { FakeDonatorRepository } from "../../tests/fakeDonatorRepository";
import { CreateDonatorUseCase } from "../createDonator/createDonator.usecase";
import { UpdateDonatorUseCase } from "./updateDonator.usecase";

describe("UpdateDonatorUseCase", () => {
  it("should update a donator", async () => {
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

    const result = await new UpdateDonatorUseCase(repository).execute(
      created.id,
      tenantId,
      { city: "Paraiso" },
    );

    expect(result.city).toBe("Paraiso");
  });

  it("should throw when donator does not exist", async () => {
    const repository = new FakeDonatorRepository();
    const tenantId = crypto.randomUUID();

    await expect(
      new UpdateDonatorUseCase(repository).execute(
        crypto.randomUUID(),
        tenantId,
        {
          city: "Palmas",
        },
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
