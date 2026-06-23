import { OverviewRepository } from "../repositories/overview.repository";

export class GetOverviewUseCase {
  constructor(private repository: OverviewRepository) {}

  async execute(tenantId: string) {
    return this.repository.getOverview(tenantId);
  }
}
