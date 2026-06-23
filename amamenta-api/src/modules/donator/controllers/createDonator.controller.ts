import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleDonatorRepository } from "../repositories/drizzleDonator.repository";
import { CreateDonatorInput } from "../schemas/createDonator.schema";
import { CreateDonatorUseCase } from "../useCases/createDonator/createDonator.usecase";
import { getRequestTenantId } from "./getRequestTenantId";

export async function createDonatorController(
  request: FastifyRequest<{ Body: CreateDonatorInput }>,
  reply: FastifyReply,
) {
  const repository = new DrizzleDonatorRepository();
  const useCase = new CreateDonatorUseCase(repository);
  const tenantId = getRequestTenantId(request);

  const donator = await useCase.execute({
    ...request.body,
    tenantId,
  });

  return reply.status(201).send(donator);
}
