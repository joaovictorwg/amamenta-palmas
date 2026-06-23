import { FastifyRequest } from "fastify";
import { BadRequestError } from "@/shared/errors/BadRequestError";

export function getRequestTenantId(request: FastifyRequest): string {
  const requestUser = request as FastifyRequest & {
    user?: { tenantId: string | null };
  };

  if (!requestUser.user?.tenantId) {
    throw new BadRequestError("Hospital nao informado");
  }

  return requestUser.user.tenantId;
}
