import { Invite } from "../entities/invite.entity";

export interface InviteRepository {
    create(data: Omit<Invite, "id" | "createdAt">): Promise<Invite>;

    findByToken(token: string): Promise<Invite | null>;

    markAsUsed(id: string): Promise<void>;

    delete(id: string): Promise<void>;
}