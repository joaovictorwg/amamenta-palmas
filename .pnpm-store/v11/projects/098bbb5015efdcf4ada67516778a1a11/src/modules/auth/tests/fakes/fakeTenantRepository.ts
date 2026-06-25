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

    async findMany(): Promise<Tenant[]> {
        return this.tenants;
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

    async update(
        id: string,
        data: Partial<Pick<Tenant, "name" | "domain" | "autoJoinByDomain" | "isActive">>
    ): Promise<Tenant | null> {
        const index = this.tenants.findIndex((tenant) => tenant.id === id);

        if (index === -1) {
            return null;
        }

        this.tenants[index] = {
            ...this.tenants[index],
            ...data,
            updatedAt: new Date(),
        };

        return this.tenants[index];
    }

    async delete(id: string): Promise<void> {
        this.tenants = this.tenants.filter((tenant) => tenant.id !== id);
    }
}
