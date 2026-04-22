import { db } from "@/shared/database/connection";
import { donators } from "@/shared/database/schema";
import { DonatorRepository } from "./donator.repository";
import { Donator } from "../entities/donator.entity";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { AppError } from "@/shared/errors/AppError";
import { PaginationMeta } from "../dtos/pagination.dto";
import { GetDonatorsRequestDTO } from "../dtos/getDonators.dto";

export class DrizzleDonatorRepository implements DonatorRepository {
  async create(data: Omit<Donator, "id">): Promise<Donator> {
    const [donator] = await db.insert(donators).values(data).returning();
    return donator as Donator;
  }

  async delete(id: string): Promise<void> {
    const result = await db
      .delete(donators)
      .where(eq(donators.id, id))
      .returning();

    if (result.length === 0) {
      throw new AppError("Donator not found", 404);
    }
  }

  async findAll({ page, limit, name, status }: GetDonatorsRequestDTO): Promise<{
    data: Donator[];
    meta: PaginationMeta;
  }> {
    const offset = (page - 1) * limit;

    const filters = [];

    if (name) {
      filters.push(ilike(donators.name, `%${name}%`));
    }

    if (status) {
      filters.push(eq(donators.status, status));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db
      .select()
      .from(donators)
      .where(whereClause)
      .orderBy(desc(donators.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: count() })
      .from(donators)
      .where(whereClause);

    const total = Number(totalResult[0].count);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<Donator | null> {
    const result = await db.select().from(donators).where(eq(donators.id, id));

    return result[0] ?? null;
  }

  async update(id: string, data: Partial<Donator>): Promise<Donator> {
    const result = await db
      .update(donators)
      .set(data)
      .where(eq(donators.id, id))
      .returning();

    return result[0];
  }
}
