import { FastifyReply, FastifyRequest } from "fastify";
import { DrizzleDonatorRepository } from "../repositories/drizzleDonator.repository";
import { GetDonatorParams } from "../schemas/getDonator.schema";
import { ExportDonatorDocumentUseCase } from "../useCases/exportDocument/exportDonatorDocument.usecase";
import { GetDonatorByIdUseCase } from "../useCases/getDonator/getDonator.usecase";
import { getRequestTenantId } from "./getRequestTenantId";

export async function exportDonatorController(
  request: FastifyRequest<{ Params: GetDonatorParams }>,
  reply: FastifyReply,
) {
  const repository = new DrizzleDonatorRepository();
  const getDonatorProfileUseCase = new GetDonatorByIdUseCase(repository);
  const useCase = new ExportDonatorDocumentUseCase(getDonatorProfileUseCase);
  const tenantId = getRequestTenantId(request);

  const { filename, buffer } = await useCase.execute(
    request.params.id,
    tenantId,
  );

  return reply
    .header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )
    .header("Content-Disposition", `attachment; filename="${filename}"`)
    .send(buffer);
}
