import { TenantRepository } from "@/modules/tenants/repositories/tenant.repository";
import { UserRepository } from "@/modules/users/repositories/user.repository";
import { AppError } from "@/shared/errors/AppError";
import { MailProvider } from "@/shared/mail/mail.provider";
import { hashPassword } from "@/shared/utils/hash";
import { sendVerificationEmail } from "../../utils/sendVerificationEmail";

interface Request {
    email: string;
    password: string;
}

export class RegisterEmployeeByDomainUseCase {
    constructor(
        private userRepository: UserRepository,
        private tenantRepository: TenantRepository,
        private mailProvider: MailProvider
    ) { }

    async execute({ email, password }: Request) {
        const normalizedEmail = email.trim().toLowerCase();
        const emailDomain = this.extractEmailDomain(normalizedEmail);

        const tenant = await this.findTenantByEmailDomain(emailDomain);

        if (!tenant) throw new AppError("Tenant not found", 404);
        if (!tenant.isActive) throw new AppError("Tenant is inactive");
        if (!tenant.autoJoinByDomain) throw new AppError("Auto join disabled");

        const existingUser = await this.userRepository.findByEmail(normalizedEmail);
        if (existingUser) throw new AppError("User already exists", 409);

        const passwordHash = await hashPassword(password);

        const user = await this.userRepository.create({
            email: normalizedEmail,
            passwordHash,
            role: "employee",
            tenantId: tenant.id,
            isVerified: false,
        });

        try {
            await sendVerificationEmail({
                mailProvider: this.mailProvider,
                userId: user.id,
                email: user.email,
            });
        } catch {
            try {
                await this.userRepository.delete(user.id);
            } catch {
                throw new AppError(
                    "Failed to send verification email and rollback registration",
                    500
                );
            }

            throw new AppError(
                "Failed to send verification email. Registration was rolled back.",
                500
            );
        }

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
                isVerified: user.isVerified,
            },
            message: "User created. Verification email sent.",
        };
    }

    private extractEmailDomain(email: string): string {
        const domain = email.split("@")[1];

        if (!domain) {
            throw new AppError("Invalid email domain");
        }

        return domain;
    }

    private async findTenantByEmailDomain(domain: string) {
        const directMatch = await this.tenantRepository.findByDomain(domain);
        if (directMatch) return directMatch;

        const parts = domain.split(".");
        for (let i = 1; i < parts.length - 1; i += 1) {
            const candidate = parts.slice(i).join(".");
            const tenant = await this.tenantRepository.findByDomain(candidate);
            if (tenant) return tenant;
        }

        return null;
    }
}
