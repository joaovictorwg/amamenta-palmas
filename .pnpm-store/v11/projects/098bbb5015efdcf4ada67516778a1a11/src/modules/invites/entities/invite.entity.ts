export type InviteRole = "admin" | "employee";

export interface Invite {
    id: string;

    email: string;

    role: InviteRole;

    tenantId: string;

    token: string;

    used: boolean;

    expiresAt: Date;

    createdAt: Date;
}