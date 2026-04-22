import { TenantRepository } from "../repositories/tenant.repository";
import { AppError } from "@/shared/errors/AppError";
import { normalizeDomain } from "../utils/normalizeDomain";

interface CreateTenantRequest {
    name: string;
    domain: string;
    autoJoinByDomain?: boolean;
}

export class CreateTenantUseCase {
    constructor(private tenantRepository: TenantRepository) { }

    async execute({ name, domain, autoJoinByDomain = false }: CreateTenantRequest) {
        const normalizedDomain = normalizeDomain(domain);

        const existing = await this.tenantRepository.findByDomain(normalizedDomain);
        if (existing) throw new AppError("Domain already in use");

        const tenant = await this.tenantRepository.create({
            name,
            domain: normalizedDomain,
            autoJoinByDomain,
        });

        return tenant;
    }
}