import { FastifyReply, FastifyRequest } from "fastify";

import { NotFoundError } from "@/shared/errors/NotFoundError";
import { DrizzleTenantRepository } from "../repositories/drizzleTenant.repository";
import { TenantIdParams, UpdateTenantInput } from "../schemas/tenant.schema";

export async function listTenantsController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const repository = new DrizzleTenantRepository();
  const tenants = await repository.findMany();

  return reply.send({ data: tenants });
}

export async function updateTenantController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as TenantIdParams;
  const body = request.body as UpdateTenantInput;
  const repository = new DrizzleTenantRepository();
  const tenant = await repository.update(id, body);

  if (!tenant) {
    throw new NotFoundError("Tenant");
  }

  return reply.send({ data: tenant });
}

export async function deleteTenantController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as TenantIdParams;
  const repository = new DrizzleTenantRepository();

  await repository.delete(id);

  return reply.status(204).send();
}
