import { Tenant } from "@/modules/tenants/entities/tenant.entity";
import { TenantRepository } from "@/modules/tenants/repositories/tenant.repository";

export class FakeTenantRepository implements TenantRepository {
    public tenants: Tenant[] = [];

    async create(
        data: Pick<Tenant, "name" | "domain" | "autoJoinByDomain">
    ): Promise<Tenant> {
        const tenant: Tenant = {
            id: crypto.randomUUID(),
            name: data.name,
            domain: data.domain,
            autoJoinByDomain: data.autoJoinByDomain,
            isActive: true,
            createdAt: new Date(),
            updatedAt: null,
        };

        this.tenants.push(tenant);
        return tenant;
    }

    async findById(id: string): Promise<Tenant | null> {
        return this.tenants.find((tenant) => tenant.id === id) ?? null;
    }

    async findByName(name: string): Promise<Tenant | null> {
        const normalizedName = name.trim().toLowerCase();

        return (
            this.tenants.find(
                (tenant) => tenant.name.trim().toLowerCase() === normalizedName
            ) ?? null
        );
    }

    async findByDomain(domain: string): Promise<Tenant | null> {
        const normalizedDomain = domain.trim().toLowerCase();

        return (
            this.tenants.find(
                (tenant) => tenant.domain.trim().toLowerCase() === normalizedDomain
            ) ?? null
        );
    }
}
