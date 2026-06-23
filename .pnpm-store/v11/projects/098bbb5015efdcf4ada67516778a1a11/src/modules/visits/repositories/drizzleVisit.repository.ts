import { and, count, desc, eq, gte, lte } from "drizzle-orm";

import { db } from "@/shared/database/connection";
import { donators, visits } from "@/shared/database/schema";
import { NotFoundError } from "@/shared/errors/NotFoundError";
import { Visit, VisitWithDonator } from "../entities/visit.entity";
import {
  CreateVisitData,
  ListVisitsParams,
  UpdateVisitData,
  VisitRepository,
} from "./visit.repository";
import { VisitStatus } from "../enums/visit.enum";

const visitSelect = {
  id: visits.id,
  tenantId: visits.tenantId,
  donatorId: visits.donatorId,
  type: visits.type,
  status: visits.status,
  scheduledAt: visits.scheduledAt,
  needsKit: visits.needsKit,
  zipCode: visits.zipCode,
  address: visits.address,
  addressNumber: visits.addressNumber,
  neighborhood: visits.neighborhood,
  city: visits.city,
  state: visits.state,
  observations: visits.observations,
  createdBy: visits.createdBy,
  createdAt: visits.createdAt,
  updatedAt: visits.updatedAt,
  donatorName: donators.name,
  donatorPhone: donators.phone,
  donatorAddress: donators.address,
  donatorNeighborhood: donators.neighborhood,
  donatorCity: donators.city,
};

export class DrizzleVisitRepository implements VisitRepository {
  async create(data: CreateVisitData): Promise<Visit> {
    const [created] = await db.insert(visits).values(data).returning();

    return created as Visit;
  }

  async findMany({
    tenantId,
    status,
    dateFrom,
    dateTo,
    page = 1,
    limit = 10,
  }: ListVisitsParams): Promise<{ data: VisitWithDonator[]; total: number }> {
    const filters = [eq(visits.tenantId, tenantId)];

    if (status) {
      filters.push(eq(visits.status, status));
    }

    if (dateFrom) {
      filters.push(gte(visits.scheduledAt, dateFrom));
    }

    if (dateTo) {
      filters.push(lte(visits.scheduledAt, dateTo));
    }

    const whereClause = and(...filters);
    const offset = (page - 1) * limit;

    const [data, totalResult] = await Promise.all([
      db
        .select(visitSelect)
        .from(visits)
        .leftJoin(
          donators,
          and(
            eq(donators.id, visits.donatorId),
            eq(donators.tenantId, visits.tenantId),
          ),
        )
        .where(whereClause)
        .orderBy(desc(visits.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(visits).where(whereClause),
    ]);

    return {
      data: data as VisitWithDonator[],
      total: Number(totalResult[0]?.count ?? 0),
    };
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<VisitWithDonator | null> {
    const [visit] = await db
      .select(visitSelect)
      .from(visits)
      .leftJoin(
        donators,
        and(
          eq(donators.id, visits.donatorId),
          eq(donators.tenantId, visits.tenantId),
        ),
      )
      .where(and(eq(visits.id, id), eq(visits.tenantId, tenantId)));

    return (visit as VisitWithDonator | undefined) ?? null;
  }

  async update(
    id: string,
    tenantId: string,
    data: UpdateVisitData,
  ): Promise<Visit> {
    const [updated] = await db
      .update(visits)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(visits.id, id), eq(visits.tenantId, tenantId)))
      .returning();

    if (!updated) {
      throw new NotFoundError("Visita");
    }

    return updated as Visit;
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: VisitStatus,
  ): Promise<Visit> {
    return this.update(id, tenantId, { status });
  }
}
