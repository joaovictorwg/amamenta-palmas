import { NotFoundError } from "@/shared/errors/NotFoundError";
import {
  DonatorExamsRepository,
  DonatorRepository,
} from "../../repositories/donator.repository";

export class ListDonatorExamsUseCase {
  constructor(
    private donatorRepository: DonatorRepository,
    private examsRepository: DonatorExamsRepository,
  ) {}

  async execute(donatorId: string, tenantId: string) {
    const donator = await this.donatorRepository.findById(donatorId, tenantId);

    if (!donator) {
      throw new NotFoundError("Doadora");
    }

    return this.examsRepository.findManyByDonatorId(donatorId, tenantId);
  }
}
