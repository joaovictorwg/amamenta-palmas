export type UserRole =
    | "admin"
    | "super_admin"
    | "employee";

export type User = {
    id: string;
    name?: string | null;
    email: string;
    role: UserRole;
    tenantId?: string | null;
};
