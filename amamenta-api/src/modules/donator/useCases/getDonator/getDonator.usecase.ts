import { AppError } from "@/shared/errors/AppError";
import { DonatorRepository } from "../repositories/donator.repository";
import { GetDonatorsRequestDTO } from "../dtos/getDonators.dto";

export class GetDonatorsUseCase {
  constructor(private repository: DonatorRepository) {}

  async execute(params: GetDonatorsRequestDTO) {
    return this.repository.findAll(params);
  }
}

export class GetDonatorByIdUseCase {
  constructor(private repository: DonatorRepository) {}

  async execute(id: string) {
    const donator = await this.repository.findById(id);

    if (!donator) {
      throw new AppError("Not Found", 404);
    }

    return donator;
  }
}
