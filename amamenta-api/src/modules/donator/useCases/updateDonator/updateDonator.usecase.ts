import { NotFoundError } from "@/shared/errors/NotFoundError";
import { Donator } from "../../entities/donator.entity";
import { DonatorRepository } from "../../repositories/donator.repository";

export class UpdateDonatorUseCase {
  constructor(private repository: DonatorRepository) {}

  async execute(id: string, tenantId: string, data: Partial<Donator>) {
    const result = await this.repository.update(id, tenantId, data);

    if (!result) {
      throw new NotFoundError("Doadora");
    }

    return result;
  }
}
