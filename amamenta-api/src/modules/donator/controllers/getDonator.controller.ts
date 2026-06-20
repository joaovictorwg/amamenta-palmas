import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleDonatorRepository } from "../repositories/drizzleDonator.repository";
import {
  GetDonatorParams,
  GetDonatorsQuery,
} from "../schemas/getDonator.schema";
import {
  GetDonatorByIdUseCase,
  GetDonatorsUseCase,
} from "../useCases/getDonator/getDonator.usecase";
import { getRequestTenantId } from "./getRequestTenantId";

export async function GetDonatorsController(
  request: FastifyRequest<{ Querystring: GetDonatorsQuery }>,
  reply: FastifyReply,
) {
  const repository = new DrizzleDonatorRepository();
  const useCase = new GetDonatorsUseCase(repository);
  const tenantId = getRequestTenantId(request);

  const { data, meta } = await useCase.execute({
    ...request.query,
    tenantId,
  });

  return reply.send({ data, meta });
}

export async function getDonatorByIdController(
  request: FastifyRequest<{ Params: GetDonatorParams }>,
  reply: FastifyReply,
) {
  const repository = new DrizzleDonatorRepository();
  const useCase = new GetDonatorByIdUseCase(repository);
  const tenantId = getRequestTenantId(request);

  const donator = await useCase.execute(request.params.id, tenantId);

  return reply.send({ data: donator });
}
