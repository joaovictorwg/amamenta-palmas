import { Invite } from "../entities/invite.entity";

export type ListInvitesParams = {
    role?: "admin" | "employee";
    tenantId?: string;
    pending?: boolean;
};

export interface InviteRepository {
    create(data: Omit<Invite, "id" | "createdAt">): Promise<Invite>;

    findMany(params?: ListInvitesParams): Promise<Invite[]>;

    findByToken(token: string): Promise<Invite | null>;

    markAsUsed(id: string): Promise<void>;

    delete(id: string): Promise<void>;
}
