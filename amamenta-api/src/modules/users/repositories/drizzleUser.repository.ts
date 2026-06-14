import { UserRepository } from "./user.repository";
import { db } from "@/shared/database/connection";
import { users } from "@/shared/database/schema/user.schema";
import { eq, and } from "drizzle-orm";
import { User } from "../entities/users.entity";

export class DrizzleUserRepository implements UserRepository {
  async create(
    data: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return user ?? null;
  }


  async findById(
    id: string,
    tenantId?: string
  ): Promise<User | null> {
    const filters = [
      eq(users.id, id),
    ];

    if (tenantId) {
      filters.push(
        eq(users.tenantId, tenantId)
      );
    }

    const [user] =
      await db
        .select()
        .from(users)
        .where(and(...filters));

    return user ?? null;
  }

  async findMany({
    tenantId,
    role,
  }: {
    tenantId?: string;
    role?: "admin" | "employee" | "super_admin";
  }): Promise<User[]> {
    const filters = [];

    if (tenantId) {
      filters.push(eq(users.tenantId, tenantId));
    }

    if (role) {
      filters.push(eq(users.role, role));
    }

    return db
      .select()
      .from(users)
      .where(filters.length ? and(...filters) : undefined);
  }

  async findManyByTenant(tenantId: string): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.tenantId, tenantId));
  }

  async findManyByTenantAndRole(
    tenantId: string,
    role: "admin" | "employee"
  ): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(
        and(eq(users.tenantId, tenantId), eq(users.role, role))
      );
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}