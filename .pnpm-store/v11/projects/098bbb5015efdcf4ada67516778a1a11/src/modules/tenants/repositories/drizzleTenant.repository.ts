import { TenantRepository } from "./tenant.repository";
import { db } from "@/shared/database/connection";
import { tenants } from "@/shared/database/schema/tenant.schema";
import { eq, ilike } from "drizzle-orm";
import { Tenant } from "../entities/tenant.entity";

export class DrizzleTenantRepository implements TenantRepository {
    async create(
        data: Pick<Tenant, "name" | "domain" | "autoJoinByDomain">
    ): Promise<Tenant> {
        const [tenant] = await db
            .insert(tenants)
            .values(data)
            .returning();

        return tenant;
    }

    async findById(id: string): Promise<Tenant | null> {
        const [tenant] = await db
            .select()
            .from(tenants)
            .where(eq(tenants.id, id));

        return tenant ?? null;
    }

    async findByName(name: string): Promise<Tenant | null> {
        const [tenant] = await db
            .select()
            .from(tenants)
            .where(ilike(tenants.name, name.trim()));

        return tenant ?? null;
    }

    async findByDomain(domain: string): Promise<Tenant | null> {
        const [tenant] = await db
            .select()
            .from(tenants)
            .where(ilike(tenants.domain, domain.trim()));

        return tenant ?? null;
    }
}
