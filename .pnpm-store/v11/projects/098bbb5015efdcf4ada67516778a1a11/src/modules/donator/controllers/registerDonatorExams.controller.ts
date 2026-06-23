import { FastifyReply, FastifyRequest } from "fastify";
import {
  DrizzleDonatorExamsRepository,
  DrizzleDonatorRepository,
} from "../repositories/drizzleDonator.repository";
import { GetDonatorParams } from "../schemas/getDonator.schema";
import { RegisterDonatorExamsInput } from "../schemas/registerDonatorExams.schema";
import { RegisterDonatorExamsUseCase } from "../useCases/registerExams/registerDonatorExams.usecase";
import { getRequestTenantId } from "./getRequestTenantId";

export async function registerDonatorExamsController(
  request: FastifyRequest<{
    Params: GetDonatorParams;
    Body: RegisterDonatorExamsInput;
  }>,
  reply: FastifyReply,
) {
  const donatorRepository = new DrizzleDonatorRepository();
  const examsRepository = new DrizzleDonatorExamsRepository();
  const useCase = new RegisterDonatorExamsUseCase(
    donatorRepository,
    examsRepository,
  );
  const tenantId = getRequestTenantId(request);

  const exam = await useCase.execute(request.params.id, tenantId, request.body);

  return reply.status(201).send({ data: exam });
}
