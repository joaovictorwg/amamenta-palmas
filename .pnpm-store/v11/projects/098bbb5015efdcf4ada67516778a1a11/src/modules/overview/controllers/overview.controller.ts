import { FastifyReply, FastifyRequest } from "fastify";

import { getRequestTenantId } from "@/modules/donator/controllers/getRequestTenantId";
import { DrizzleOverviewRepository } from "../repositories/drizzleOverview.repository";
import { GetOverviewUseCase } from "../useCases/getOverview.usecase";

export async function getOverviewController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const tenantId = getRequestTenantId(request);
  const repository = new DrizzleOverviewRepository();
  const useCase = new GetOverviewUseCase(repository);
  const overview = await useCase.execute(tenantId);

  return reply.send({ data: overview });
}
