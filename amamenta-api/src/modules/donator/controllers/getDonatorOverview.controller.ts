import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleDonatorRepository } from "../repositories/drizzleDonator.repository";
import { GetDonatorOverviewUseCase } from "../useCases/getDonatorOverview/getDonatorOverview.usecase";
import { getRequestTenantId } from "./getRequestTenantId";

export async function getDonatorOverviewController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const repository = new DrizzleDonatorRepository();
  const useCase = new GetDonatorOverviewUseCase(repository);
  const tenantId = getRequestTenantId(request);

  const overview = await useCase.execute(tenantId);

  return reply.send({ data: overview });
}
