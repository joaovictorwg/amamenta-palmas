import { FastifyRequest, FastifyReply } from "fastify";
import { DrizzleInviteRepository } from "../repositories/drizzleInvite.repository";
import { AcceptInviteUseCase } from "../use-cases/acceptInvite.usecase";
import { DrizzleUserRepository } from "@/modules/users/repositories/drizzleUser.repository";
import { DrizzleTenantRepository } from "@/modules/tenants/repositories/drizzleTenant.repository";
import { AcceptInviteInput } from "../schemas/acceptInvite.schema";
import { t, SupportedLang } from "@/shared/i18n";

export async function acceptInviteController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { token, password } = request.body as AcceptInviteInput;

    const inviteRepo = new DrizzleInviteRepository();
    const userRepo = new DrizzleUserRepository();
    const tenantRepo = new DrizzleTenantRepository();

    const useCase = new AcceptInviteUseCase(inviteRepo, userRepo, tenantRepo);

    const user = await useCase.execute({ token, password });

    // Detecta idioma do header ou usa pt
    const lang: SupportedLang = (request.headers['accept-language']?.toString().startsWith('en') ? 'en' : 'pt');

    return reply.send({
        success: true,
        message: t('success.invite_accepted', lang),
        user,
    });
}