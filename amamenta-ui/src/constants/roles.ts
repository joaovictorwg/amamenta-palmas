export const ROLES = {
    ADMIN: "admin",
    SUPER_ADMIN: "super_admin",
    EMPLOYEE: "employee",
} as const;

export const ALLOWED_DASHBOARD_ROLES = [
    ROLES.ADMIN,
    ROLES.EMPLOYEE,
];

export const ALLOWED_SUPERADMIN_ROLES = [
    ROLES.SUPER_ADMIN
];