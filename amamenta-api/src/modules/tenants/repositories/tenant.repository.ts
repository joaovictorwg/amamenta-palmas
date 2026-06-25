import { Tenant } from "../entities/tenant.entity";

export interface TenantRepository {
    create(data: Pick<Tenant, "name" | "domain" | "autoJoinByDomain">): Promise<Tenant>;
    findMany(): Promise<Tenant[]>;
    findById(id: string): Promise<Tenant | null>;
    findByName(name: string): Promise<Tenant | null>;
    findByDomain(domain: string): Promise<Tenant | null>;
    update(id: string, data: Partial<Pick<Tenant, "name" | "domain" | "autoJoinByDomain" | "isActive">>): Promise<Tenant | null>;
    delete(id: string): Promise<void>;
}
