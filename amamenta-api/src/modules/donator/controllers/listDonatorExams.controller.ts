import { FastifyReply, FastifyRequest } from "fastify";
import {
  DrizzleDonatorExamsRepository,
  DrizzleDonatorRepository,
} from "../repositories/drizzleDonator.repository";
import { GetDonatorParams } from "../schemas/getDonator.schema";
import { ListDonatorExamsUseCase } from "../useCases/listExams/listDonatorExams.usecase";
import { getRequestTenantId } from "./getRequestTenantId";

export async function listDonatorExamsController(
  request: FastifyRequest<{ Params: GetDonatorParams }>,
  reply: FastifyReply,
) {
  const donatorRepository = new DrizzleDonatorRepository();
  const examsRepository = new DrizzleDonatorExamsRepository();
  const useCase = new ListDonatorExamsUseCase(
    donatorRepository,
    examsRepository,
  );
  const tenantId = getRequestTenantId(request);

  const exams = await useCase.execute(request.params.id, tenantId);

  return reply.send({ data: exams });
}
