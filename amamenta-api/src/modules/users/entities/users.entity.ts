export type UserRole = "super_admin" | "admin" | "employee";

export interface User {
  id: string;

  name?: string | null;
  email: string;
  passwordHash: string;

  role: UserRole;

  tenantId: string | null; 
  // 🔥 null para:
  // - super_admin
  // - donator
  // obrigatório para employee/admin

  isVerified: boolean;

  createdAt: Date;
  updatedAt?: Date | null;
}