import { NotFoundError } from "@/shared/errors/NotFoundError";
import { GetDonatorsRequestDTO } from "../../dtos/getDonators.dto";
import { DonatorRepository } from "../../repositories/donator.repository";

export class GetDonatorsUseCase {
  constructor(private repository: DonatorRepository) {}

  async execute(params: GetDonatorsRequestDTO) {
    return this.repository.findMany(params);
  }
}

export class GetDonatorByIdUseCase {
  constructor(private repository: DonatorRepository) {}

  async execute(id: string, tenantId: string) {
    const donator = await this.repository.findById(id, tenantId);

    if (!donator) {
      throw new NotFoundError("Doadora");
    }

    return donator;
  }
}
