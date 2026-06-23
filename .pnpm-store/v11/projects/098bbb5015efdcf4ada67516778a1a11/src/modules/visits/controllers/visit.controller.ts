import { FastifyReply, FastifyRequest } from "fastify";

import { DrizzleDonatorRepository } from "@/modules/donator/repositories/drizzleDonator.repository";
import { getRequestTenantId } from "@/modules/donator/controllers/getRequestTenantId";
import { DrizzleVisitRepository } from "../repositories/drizzleVisit.repository";
import {
  CreateVisitUseCase,
  ListVisitsUseCase,
  RequestVisitUseCase,
  UpdateVisitStatusUseCase,
  UpdateVisitUseCase,
} from "../useCases/visit.usecase";
import {
  CreateVisitInput,
  ListVisitsQuery,
  RequestVisitInput,
  UpdateVisitInput,
  UpdateVisitStatusInput,
  VisitIdParams,
} from "../schemas/visit.schema";

export async function createVisitController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = request.body as CreateVisitInput;
  const tenantId = getRequestTenantId(request);
  const visitRepository = new DrizzleVisitRepository();
  const donatorRepository = new DrizzleDonatorRepository();
  const useCase = new CreateVisitUseCase(visitRepository, donatorRepository);

  const visit = await useCase.execute({
    ...body,
    tenantId,
    createdBy: request.user.id,
  });

  return reply.status(201).send({ data: visit });
}

export async function requestVisitController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = request.body as RequestVisitInput;
  const visitRepository = new DrizzleVisitRepository();
  const donatorRepository = new DrizzleDonatorRepository();
  const useCase = new RequestVisitUseCase(visitRepository, donatorRepository);

  await useCase.execute(body);

  return reply.status(202).send({ message: "visit.request_received" });
}

export async function listVisitsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const query = request.query as ListVisitsQuery;
  const tenantId = getRequestTenantId(request);
  const repository = new DrizzleVisitRepository();
  const useCase = new ListVisitsUseCase(repository);
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;

  const { data, total } = await useCase.execute({
    ...query,
    tenantId,
    page,
    limit,
  });

  return reply.send({
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
}

export async function updateVisitController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as VisitIdParams;
  const body = request.body as UpdateVisitInput;
  const tenantId = getRequestTenantId(request);
  const repository = new DrizzleVisitRepository();
  const useCase = new UpdateVisitUseCase(repository);
  const data = await useCase.execute(params.id, tenantId, body);

  return reply.send({ data });
}

export async function updateVisitStatusController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as VisitIdParams;
  const body = request.body as UpdateVisitStatusInput;
  const tenantId = getRequestTenantId(request);
  const repository = new DrizzleVisitRepository();
  const useCase = new UpdateVisitStatusUseCase(repository);
  const data = await useCase.execute(
    params.id,
    tenantId,
    body.status,
  );

  return reply.send({ data });
}
