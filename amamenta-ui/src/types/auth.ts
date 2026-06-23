export type UserRole =
    | "admin"
    | "super_admin"
    | "employee";

export type User = {
    id: string;
    email: string;
    role: UserRole;
    tenantId?: string | null;
};
