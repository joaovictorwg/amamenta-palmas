import { InviteRepository } from "./invite.repository";
import { db } from "@/shared/database/connection";
import { invites } from "@/shared/database/schema/invite.schema";
import { eq } from "drizzle-orm";
import { Invite } from "../entities/invite.entity";

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