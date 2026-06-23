import { FastifyReply, FastifyRequest } from "fastify";

import { getRequestTenantId } from "./getRequestTenantId";
import { DrizzleDonationOverviewRepository } from "../repositories/overview/drizzleDonationOverview.repository";
import { GetDonationOverviewUseCase } from "../use-cases/overview/getDonationOverview.usecase";

export async function getDonationOverviewController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const tenantId = getRequestTenantId(request);
  const repository = new DrizzleDonationOverviewRepository();
  const useCase = new GetDonationOverviewUseCase(repository);
  const overview = await useCase.execute(tenantId);

  return reply.send({ data: overview });
}
