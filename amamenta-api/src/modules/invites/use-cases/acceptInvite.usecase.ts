import { UserRepository } from "@/modules/users/repositories/user.repository";
import { InviteRepository } from "../repositories/invite.repository";
import { TenantRepository } from "@/modules/tenants/repositories/tenant.repository";
import { hashPassword } from "@/shared/utils/hash";
import { AppError } from "@/shared/errors/AppError";
import { NotFoundError } from "@/shared/errors/NotFoundError";

interface Request {
    token: string;
    password: string;
}

export class AcceptInviteUseCase {
    constructor(
        private inviteRepository: InviteRepository,
        private userRepository: UserRepository,
        private tenantRepository: TenantRepository
    ) { }

    async execute({ token, password }: Request) {
        const invite = await this.inviteRepository.findByToken(token);


        if (!invite) throw new AppError("i18n:errors.invalid_invite_token", 400);
        if (invite.used) throw new AppError("i18n:errors.invite_already_used", 400);
        if (new Date() > invite.expiresAt) throw new AppError("i18n:errors.invalid_invite_token", 400);

        const tenant = await this.tenantRepository.findById(invite.tenantId);

        if (!tenant) throw new AppError("i18n:errors.tenant_not_found", 404);

        if (tenant.domain) {
            const emailDomain = invite.email.split("@")[1];
            const sameDomain = emailDomain === tenant.domain;
            const subdomainMatch = emailDomain.endsWith(`.${tenant.domain}`);

            if (!sameDomain && !subdomainMatch) {
                throw new AppError("i18n:errors.forbidden", 403);
            }
        }

        const passwordHash = await hashPassword(password);


        // Verifica se usuário já existe
        const existingUser = await this.userRepository.findByEmail(invite.email);
        if (existingUser) {
            throw new AppError("i18n:errors.user_already_exists", 409);
        }

        const user = await this.userRepository.create({
            email: invite.email,
            passwordHash,
            role: invite.role,
            tenantId: invite.tenantId,
            isVerified: true,
            twoFactorEnabled: false,
        });

        await this.inviteRepository.markAsUsed(invite.id);

        return user;
    }
}