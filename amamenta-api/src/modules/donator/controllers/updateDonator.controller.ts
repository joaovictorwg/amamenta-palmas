import { FastifyReply, FastifyRequest } from "fastify";
import { UpdateDonatorDTO } from "../schemas/updateDonator.schema";
import { DrizzleDonatorRepository } from "../repositories/drizzleDonator.repository";
import { UpdateDonatorUseCase } from "../useCases/updateDonator/updateDonator.usecase";
import { getRequestTenantId } from "./getRequestTenantId";

export async function UpdateDonatorController(
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateDonatorDTO;
  }>,
  reply: FastifyReply,
) {
  const repository = new DrizzleDonatorRepository();
  const useCase = new UpdateDonatorUseCase(repository);
  const tenantId = getRequestTenantId(request);

  const donator = await useCase.execute(
    request.params.id,
    tenantId,
    request.body,
  );

  return reply.send({
    data: donator,
  });
}
