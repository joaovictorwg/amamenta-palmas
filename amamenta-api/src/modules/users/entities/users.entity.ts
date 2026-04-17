export type UserRole = "super_admin" | "admin" | "employee" | "donator";

export interface User {
  id: string;

  email: string;
  passwordHash: string;

  role: UserRole;

  tenantId: string | null; 
  // 🔥 null para:
  // - super_admin
  // - donator
  // obrigatório para employee/admin

  isVerified: boolean;

  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;

  createdAt: Date;
  updatedAt?: Date | null;
}