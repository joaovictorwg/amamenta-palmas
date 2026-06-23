import { DonatorRepository } from "../../repositories/donator.repository";

export class GetDonatorOverviewUseCase {
  constructor(private repository: DonatorRepository) {}

  async execute(tenantId: string) {
    return this.repository.getOverview(tenantId);
  }
}
