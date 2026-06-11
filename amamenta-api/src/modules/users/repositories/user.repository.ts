import { User } from "../entities/users.entity";

 
export interface UserRepository {
  create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;

  findByEmail(email: string): Promise<User | null>;

  findById(id: string): Promise<User | null>;

  findMany(filters: {
    tenantId?: string;
    role?: "admin" | "employee" | "super_admin";
  }): Promise<User[]>;

  findManyByTenant(tenantId: string): Promise<User[]>;

  findManyByTenantAndRole(
    tenantId: string,
    role: "admin" | "employee"
  ): Promise<User[]>;

  update(id: string, data: Partial<User>): Promise<User>;

  delete(id: string): Promise<void>;
}