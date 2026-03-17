import { AppError } from "@/shared/errors/AppError";
import { Donator } from "../entities/donator.entity";
import { DonatorRepository } from "../repositories/donator.repository";

export class UpdateDonatorUseCase {
  constructor(private repository: DonatorRepository) {}

  async execute(id: string, data: Partial<Donator>) {
    const result = await this.repository.update(id, data);

    if (!result) {
      throw new AppError("Donator Not Found", 404);
    }

    return result;
  }
}
