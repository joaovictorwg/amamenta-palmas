import { InviteRepository } from "./invite.repository";
import { db } from "@/shared/database/connection";
import { invites } from "@/shared/database/schema/invite.schema";
import { and, desc, eq, gt } from "drizzle-orm";
import { Invite } from "../entities/invite.entity";
import { ListInvitesParams } from "./invite.repository";

export class DrizzleInviteRepository implements InviteRepository {
    async create(
        data: Omit<Invite, "id" | "createdAt">
    ): Promise<Invite> {
        const [invite] = await db
            .insert(invites)
            .values(data)
            .returning();

        return invite;
    }

    async findByToken(token: string): Promise<Invite | null> {
        const [invite] = await db
            .select()
            .from(invites)
            .where(eq(invites.token, token));

        return invite ?? null;
    }

    async findMany(params: ListInvitesParams = {}): Promise<Invite[]> {
        const filters = [];

        if (params.role) {
            filters.push(eq(invites.role, params.role));
        }

        if (params.tenantId) {
            filters.push(eq(invites.tenantId, params.tenantId));
        }

        if (params.pending) {
            filters.push(eq(invites.used, false), gt(invites.expiresAt, new Date()));
        }

        return db
            .select()
            .from(invites)
            .where(filters.length ? and(...filters) : undefined)
            .orderBy(desc(invites.createdAt)) as Promise<Invite[]>;
    }

    async markAsUsed(id: string): Promise<void> {
        await db
            .update(invites)
            .set({ used: true })
            .where(eq(invites.id, id));
    }

    async delete(id: string): Promise<void> {
        await db
            .delete(invites)
            .where(eq(invites.id, id));
    }
}
