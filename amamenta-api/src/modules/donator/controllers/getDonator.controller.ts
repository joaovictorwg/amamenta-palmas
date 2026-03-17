import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleDonatorRepository } from "../repositories/drizzleDonator.repository";

import { GetDonatorsQuery } from "../schemas/getDonator.schema";
import {
  GetDonatorByIdUseCase,
  GetDonatorsUseCase,
} from "../useCases/getDonator/getDonator.usecase";

export async function GetDonatorsController(
  request: FastifyRequest<{ Querystring: GetDonatorsQuery }>,
  reply: FastifyReply,
) {
  const query = request.query;

  const repository = new DrizzleDonatorRepository();
  const useCase = new GetDonatorsUseCase(repository);

  const { data, meta } = await useCase.execute(query);

  return reply.send({
    data,
    meta,
  });
}

export async function getDonatorByIdController(
  request: FastifyRequest<{ Params: { ìd: string } }>,
  reply: FastifyReply,
) {
  const repository = new DrizzleDonatorRepository();
  const useCase = new GetDonatorByIdUseCase(repository);

  const donator = await useCase.execute(request.params.ìd);

  return reply.send({
    data: donator,
  });
}
