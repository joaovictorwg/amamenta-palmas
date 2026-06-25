import { FastifyReply, FastifyRequest } from "fastify";

import { AppError } from "@/shared/errors/AppError";
import { comparePassword, hashPassword } from "@/shared/utils/hash";
import { DrizzleUserRepository } from "../repositories/drizzleUser.repository";
import { ChangePasswordInput } from "../schemas/changePassword.schema";

export async function changePasswordController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = request.body as ChangePasswordInput;
  const repository = new DrizzleUserRepository();
  const user = await repository.findById(request.user.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const passwordMatches = await comparePassword(
    body.currentPassword,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError("Senha atual invalida", 400);
  }

  await repository.update(user.id, {
    passwordHash: await hashPassword(body.newPassword),
  });

  return reply.send({ message: "Senha alterada com sucesso" });
}
