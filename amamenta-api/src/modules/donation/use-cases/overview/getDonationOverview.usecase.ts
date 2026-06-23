import { DonationOverviewRepository } from "../../repositories/overview/donationOverview.repository";

export class GetDonationOverviewUseCase {
  constructor(private repository: DonationOverviewRepository) {}

  async execute(tenantId: string) {
    return this.repository.getOverview(tenantId);
  }
}
