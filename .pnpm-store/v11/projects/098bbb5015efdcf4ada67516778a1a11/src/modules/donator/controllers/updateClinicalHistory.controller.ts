import { FastifyReply, FastifyRequest } from "fastify";
import {
  DrizzleDonatorClinicalHistoryRepository,
  DrizzleDonatorRepository,
} from "../repositories/drizzleDonator.repository";
import { GetDonatorParams } from "../schemas/getDonator.schema";
import { UpdateClinicalHistoryInput } from "../schemas/updateClinicalHistory.schema";
import { UpdateDonatorClinicalHistoryUseCase } from "../useCases/updateClinicalHistory/updateClinicalHistory.usecase";
import { getRequestTenantId } from "./getRequestTenantId";

export async function updateClinicalHistoryController(
  request: FastifyRequest<{
    Params: GetDonatorParams;
    Body: UpdateClinicalHistoryInput;
  }>,
  reply: FastifyReply,
) {
  const donatorRepository = new DrizzleDonatorRepository();
  const clinicalHistoryRepository =
    new DrizzleDonatorClinicalHistoryRepository();
  const useCase = new UpdateDonatorClinicalHistoryUseCase(
    donatorRepository,
    clinicalHistoryRepository,
  );
  const tenantId = getRequestTenantId(request);

  const clinicalHistory = await useCase.execute(
    request.params.id,
    tenantId,
    request.body,
  );

  return reply.send({ data: clinicalHistory });
}
