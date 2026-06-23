import { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { ForbiddenError } from "../errors/ForbiddenError";

type AllowedRole = "super_admin" | "admin" | "employee";

export function authorize(roles: AllowedRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new UnauthorizedError("Missing authentication");
    }

    if (!roles.includes(request.user.role as AllowedRole)) {
      throw new ForbiddenError();
    }
  };
}