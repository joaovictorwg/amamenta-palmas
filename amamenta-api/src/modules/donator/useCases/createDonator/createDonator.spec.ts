import { FakeDonatorRepository } from "../../tests/fakeDonatorRepository";
import { CreateDonatorUseCase } from "./createDonator.usecase";

describe("CreateDonatorUseCase", () => {
  let fakeRepository: any;
  let createDonatorUseCase: CreateDonatorUseCase;

  beforeEach(() => {
    fakeRepository = new FakeDonatorRepository();
    createDonatorUseCase = new CreateDonatorUseCase(fakeRepository);
  });

  it("should create a new donator", async () => {
    const data = {
      name: "Maria",
      phone: "999999999",
      address: "Rua A",
    };

    const result = await createDonatorUseCase.execute(data);

    expect(result).toHaveProperty("id");
    expect(result.name).toBe("Maria");
    expect(result.status).toBe("active");
    expect(result.createdAt).toBeInstanceOf(Date);
  });
});
