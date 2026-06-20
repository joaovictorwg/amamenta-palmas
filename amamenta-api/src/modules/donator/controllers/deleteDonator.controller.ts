import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleDonatorRepository } from "../repositories/drizzleDonator.repository";
import { DeleteDonatorUseCase } from "../useCases/deleteDonator/deleteDonator.usecase";
import { getRequestTenantId } from "./getRequestTenantId";

export async function DeleteDonatorController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const repository = new DrizzleDonatorRepository();
  const useCase = new DeleteDonatorUseCase(repository);
  const tenantId = getRequestTenantId(request);

  await useCase.execute(request.params.id, tenantId);

  return reply.status(204).send();
}
