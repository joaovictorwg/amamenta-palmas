import { User } from "@/modules/users/entities/users.entity";
import { UserRepository } from "@/modules/users/repositories/user.repository";

export class FakeUserRepository implements UserRepository {
    public users: User[] = [];

    async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
        const user: User = {
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: null,
            ...data,
        };

        this.users.push(user);
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.users.find((user) => user.email === email) ?? null;
    }

    async findById(id: string): Promise<User | null> {
        return this.users.find((user) => user.id === id) ?? null;
    }

    async findMany(filters: {
        tenantId?: string;
        role?: "admin" | "employee" | "super_admin";
    }): Promise<User[]> {
        return this.users.filter((user) => {
            if (filters.tenantId && user.tenantId !== filters.tenantId) {
                return false;
            }
            if (filters.role && user.role !== filters.role) {
                return false;
            }
            return true;
        });
    }

    async findManyByTenant(tenantId: string): Promise<User[]> {
        return this.users.filter((user) => user.tenantId === tenantId);
    }

    async findManyByTenantAndRole(
        tenantId: string,
        role: "admin" | "employee"
    ): Promise<User[]> {
        return this.users.filter(
            (user) => user.tenantId === tenantId && user.role === role
        );
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        const index = this.users.findIndex((user) => user.id === id);

        if (index === -1) {
            throw new Error("User not found");
        }

        this.users[index] = {
            ...this.users[index],
            ...data,
            updatedAt: new Date(),
        };

        return this.users[index];
    }

    async delete(id: string): Promise<void> {
        this.users = this.users.filter((user) => user.id !== id);
    }
}
