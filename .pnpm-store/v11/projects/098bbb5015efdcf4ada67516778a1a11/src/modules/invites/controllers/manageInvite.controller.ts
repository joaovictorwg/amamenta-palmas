import { FastifyReply, FastifyRequest } from "fastify";

import { ForbiddenError } from "@/shared/errors/ForbiddenError";
import { DrizzleInviteRepository } from "../repositories/drizzleInvite.repository";
import { InviteIdParams, ListInvitesInput } from "../schemas/listInvites.schema";

export async function listInvitesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const query = request.query as ListInvitesInput;
  const repository = new DrizzleInviteRepository();
  const tenantId =
    request.user.role === "admin" ? request.user.tenantId ?? undefined : query.tenantId;

  const invites = await repository.findMany({
    role: query.role,
    tenantId,
    pending: query.pending,
  });

  return reply.send({ data: invites });
}

export async function deleteInviteController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as InviteIdParams;
  const repository = new DrizzleInviteRepository();

  if (request.user.role === "admin") {
    const tenantInvites = await repository.findMany({
      tenantId: request.user.tenantId ?? undefined,
    });

    if (!tenantInvites.some((invite) => invite.id === id)) {
      throw new ForbiddenError("You don't have permission to delete this invite");
    }
  }

  await repository.delete(id);

  return reply.status(204).send();
}
