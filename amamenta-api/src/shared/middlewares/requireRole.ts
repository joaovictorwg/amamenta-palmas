import { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../errors/UnauthorizedError";

type Role = "super_admin" | "admin" | "employee" | "donator";

export function requireRole(roles: Role | Role[]) {
    return async function (
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        const user = request.user;

        if (!user) {
            throw new UnauthorizedError("Not authenticated");
        }

        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(user.role)) {
            return reply.status(403).send({
                message: "Forbidden",
            });
        }
    };
}