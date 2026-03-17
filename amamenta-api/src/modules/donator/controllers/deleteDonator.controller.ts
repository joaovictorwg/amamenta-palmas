import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleDonatorRepository } from "../repositories/drizzleDonator.repository";
import { DeleteDonatorUseCase } from "../useCases/deleteDonator/deleteDonator.usecase";

export async function DeleteDonatorController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const repository = new DrizzleDonatorRepository();
  const useCase = new DeleteDonatorUseCase(repository);

  await useCase.execute(request.params.id);

  return reply.status(204).send();
}
