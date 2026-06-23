import { ConflictError } from "@/shared/errors/ConflictError";
import { DonatorStatus } from "../../enums/donatorStatus.enum";
import { FakeDonatorRepository } from "../../tests/fakeDonatorRepository";
import { CreateDonatorUseCase } from "./createDonator.usecase";

describe("CreateDonatorUseCase", () => {
  let fakeRepository: FakeDonatorRepository;
  let createDonatorUseCase: CreateDonatorUseCase;

  beforeEach(() => {
    fakeRepository = new FakeDonatorRepository();
    createDonatorUseCase = new CreateDonatorUseCase(fakeRepository);
  });

  it("should create a new donator with pending exams status", async () => {
    const result = await createDonatorUseCase.execute({
      name: "Maria",
      phone: "63999999999",
      address: "Rua A",
      neighborhood: "Centro",
      city: "Palmas",
      state: "TO",
      tenantId: crypto.randomUUID(),
    });

    expect(result).toHaveProperty("id");
    expect(result.name).toBe("Maria");
    expect(result.status).toBe(DonatorStatus.PENDING_EXAMS);
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("should not create two donators with the same phone in the same tenant", async () => {
    const tenantId = crypto.randomUUID();
    const data = {
      name: "Maria",
      phone: "63999999999",
      address: "Rua A",
      neighborhood: "Centro",
      city: "Palmas",
      state: "TO",
      tenantId,
    };

    await createDonatorUseCase.execute(data);

    await expect(createDonatorUseCase.execute(data)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });
});
