import { Donator, DonatorStatus } from "../../entities/donator.entity";
import { DonatorRepository } from "../../repositories/donator.repository";

interface CreateDonatorRequest {
  name: string;
  phone: string;
  address: string;
}

export class CreateDonatorUseCase {
  constructor(private donatorRepository: DonatorRepository) {}

  async execute(data: CreateDonatorRequest): Promise<Donator> {
    const donator = await this.donatorRepository.create({
      ...data,
      status: "active" as DonatorStatus,
      createdAt: new Date(),
    });

    return donator;
  }
}
