import { FastifyRequest, FastifyReply } from "fastify";
import { DrizzleDonatorRepository } from "../repositories/drizzleDonator.repository";
import { CreateDonatorUseCase } from "../useCases/createDonator/createDonator.usecase";

export async function createDonatorController(
  request: FastifyRequest, // recebe requisição
  reply: FastifyReply, // resposta pro usuario
) {
  const repository = new DrizzleDonatorRepository();
  const useCase = new CreateDonatorUseCase(repository);

  const donator = await useCase.execute(request.body as any);

  return reply.status(201).send(donator);
}
