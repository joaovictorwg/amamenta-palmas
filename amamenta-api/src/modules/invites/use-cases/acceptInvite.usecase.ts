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

        if (!invite) throw new NotFoundError("Invite");
        if (invite.used) throw new AppError("Invite already used");
        if (new Date() > invite.expiresAt) throw new AppError("Invite expired");

        const tenant = await this.tenantRepository.findById(invite.tenantId);

        if (!tenant) throw new NotFoundError("Tenant");

        if (tenant.domain) {
            const emailDomain = invite.email.split("@")[1];
            const sameDomain = emailDomain === tenant.domain;
            const subdomainMatch = emailDomain.endsWith(`.${tenant.domain}`);

            if (!sameDomain && !subdomainMatch) {
                throw new AppError(
                    `Email must belong to domain @${tenant.domain}`
                );
            }
        }

        const passwordHash = await hashPassword(password);

        const user = await this.userRepository.create({
            email: invite.email,
            passwordHash,
            role: invite.role,
            tenantId: invite.tenantId,
            isVerified: true,
        });

        await this.inviteRepository.markAsUsed(invite.id);

        return user;
    }
}