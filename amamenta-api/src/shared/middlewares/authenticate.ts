import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError } from "../errors/UnauthorizedError";

interface TokenPayload {
  sub: string;
  role: "super_admin" | "admin" | "employee" | "donator";
  tenantId: string | null;
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError("Missing token");
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    throw new UnauthorizedError("Invalid token format");
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;

    request.user = {
      id: decoded.sub,
      role: decoded.role,
      tenantId: decoded.tenantId,
    };
  } catch (err) {
    throw new UnauthorizedError("Invalid or expired token");
  }
}