import { and, count, desc, eq, gte, ilike, lt, lte, sql } from "drizzle-orm";

import { db } from "@/shared/database/connection";
import {
  donatorClinicalHistories,
  donatorExams,
  donators,
} from "@/shared/database/schema";
import { GetDonatorsRequestDTO } from "../dtos/getDonators.dto";
import { PaginationMeta } from "../dtos/pagination.dto";
import {
  Donator,
  DonatorClinicalHistory,
  DonatorExam,
  DonatorProfile,
} from "../entities/donator.entity";
import { DonatorStatus } from "../enums/donatorStatus.enum";
import {
  CreateDonatorData,
  CreateDonatorExamData,
  DonatorClinicalHistoryRepository,
  DonatorExamsRepository,
  DonatorOverview,
  DonatorRepository,
  UpsertDonatorClinicalHistoryData,
} from "./donator.repository";

export class DrizzleDonatorRepository implements DonatorRepository {
  async create(data: CreateDonatorData): Promise<Donator> {
    const [donator] = await db.insert(donators).values(data).returning();
    return donator as Donator;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await db
      .delete(donators)
      .where(and(eq(donators.id, id), eq(donators.tenantId, tenantId)));
  }

  async findAll(params: GetDonatorsRequestDTO): Promise<{
    data: Donator[];
    meta: PaginationMeta;
  }> {
    return this.findMany(params);
  }

  async findMany({
    tenantId,
    page = 1,
    limit = 10,
    name,
    status,
    city,
    pendingExams,
  }: GetDonatorsRequestDTO): Promise<{
    data: Donator[];
    meta: PaginationMeta;
  }> {
    const offset = (page - 1) * limit;
    const filters = [eq(donators.tenantId, tenantId)];

    if (name) {
      filters.push(ilike(donators.name, `%${name}%`));
    }

    if (city) {
      filters.push(ilike(donators.city, `%${city}%`));
    }

    if (status) {
      filters.push(eq(donators.status, status));
    }

    if (pendingExams) {
      filters.push(eq(donators.status, DonatorStatus.PENDING_EXAMS));
    }

    const whereClause = filters.length ? and(...filters) : undefined;

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
      data: data as Donator[],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, tenantId: string): Promise<DonatorProfile | null> {
    const [row] = await db
      .select({
        donator: donators,
        clinicalHistory: donatorClinicalHistories,
      })
      .from(donators)
      .leftJoin(
        donatorClinicalHistories,
        eq(donatorClinicalHistories.donatorId, donators.id),
      )
      .where(and(eq(donators.id, id), eq(donators.tenantId, tenantId)));

    if (!row) {
      return null;
    }

    const [latestExam] = await db
      .select()
      .from(donatorExams)
      .innerJoin(donators, eq(donators.id, donatorExams.donatorId))
      .where(and(eq(donatorExams.donatorId, id), eq(donators.tenantId, tenantId)))
      .orderBy(desc(donatorExams.createdAt))
      .limit(1);

    return {
      ...(row.donator as Donator),
      clinicalHistory: row.clinicalHistory as DonatorClinicalHistory | null,
      latestExam: (latestExam?.donator_exams as DonatorExam | undefined) ?? null,
    };
  }

  async findByPhone(phone: string, tenantId: string): Promise<Donator | null> {
    const [donator] = await db
      .select()
      .from(donators)
      .where(and(eq(donators.phone, phone), eq(donators.tenantId, tenantId)))
      .limit(1);

    return (donator as Donator | undefined) ?? null;
  }

  async getOverview(tenantId: string): Promise<DonatorOverview> {
    const now = new Date();
    const inactivityRiskDate = new Date(now);
    const weekStart = new Date(now);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const registrationDate = sql<Date>`coalesce(${donators.registeredAt}, ${donators.createdAt})`;
    const registrationMonth = sql<number>`extract(month from ${registrationDate})::int`;

    inactivityRiskDate.setDate(now.getDate() - 50);
    weekStart.setDate(now.getDate() - 7);

    const countDonators = async (
      whereClause: ReturnType<typeof and>,
    ): Promise<number> => {
      const [row] = await db
        .select({ total: count() })
        .from(donators)
        .where(whereClause);

      return Number(row.total);
    };

    const [
      activeDonators,
      pendingExams,
      inactivityRisk,
      pendingVisits,
      inactivatedThisWeek,
      newWhatsappRegistrations,
      examsExpiringRows,
      monthlyRows,
      statusRows,
      latestRegistrations,
    ] = await Promise.all([
      countDonators(and(eq(donators.tenantId, tenantId), eq(donators.status, DonatorStatus.ACTIVE))),
      countDonators(and(eq(donators.tenantId, tenantId), eq(donators.status, DonatorStatus.PENDING_EXAMS))),
      countDonators(
        and(
          eq(donators.tenantId, tenantId),
          eq(donators.status, DonatorStatus.ACTIVE),
          lt(donators.lastCollectionDate, inactivityRiskDate),
        ),
      ),
      countDonators(
        and(
          eq(donators.tenantId, tenantId),
          eq(donators.status, DonatorStatus.PENDING_EXAMS),
          eq(donators.homeCollection, true),
        ),
      ),
      countDonators(
        and(
          eq(donators.tenantId, tenantId),
          eq(donators.status, DonatorStatus.INACTIVE),
          gte(donators.updatedAt, weekStart),
        ),
      ),
      countDonators(
        and(
          eq(donators.tenantId, tenantId),
          gte(donators.createdAt, weekStart),
          ilike(donators.guidanceSourceOther, "%whatsapp%"),
        ),
      ),
      db
        .select({ total: count() })
        .from(donatorExams)
        .innerJoin(donators, eq(donators.id, donatorExams.donatorId))
        .where(
          and(
            eq(donators.tenantId, tenantId),
            gte(donatorExams.validUntil, now),
            lte(donatorExams.validUntil, monthEnd),
          ),
        ),
      db
        .select({ month: registrationMonth, total: count() })
        .from(donators)
        .where(and(eq(donators.tenantId, tenantId), gte(registrationDate, yearStart)))
        .groupBy(registrationMonth),
      db
        .select({ status: donators.status, total: count() })
        .from(donators)
        .where(eq(donators.tenantId, tenantId))
        .groupBy(donators.status),
      db
        .select({
          id: donators.id,
          name: donators.name,
          phone: donators.phone,
          status: donators.status,
        })
        .from(donators)
        .where(eq(donators.tenantId, tenantId))
        .orderBy(desc(donators.createdAt))
        .limit(5),
    ]);

    const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
    const monthlyNewDonators = Array.from({ length: 12 }, (_, index) => ({
      month: monthFormatter.format(new Date(now.getFullYear(), index, 1)).replace(".", ""),
      total: Number(monthlyRows.find((row) => Number(row.month) === index + 1)?.total ?? 0),
    }));

    return {
      metrics: {
        activeDonators,
        pendingExams,
        inactivityRisk,
        pendingVisits,
      },
      alerts: {
        examsExpiringThisMonth: Number(examsExpiringRows[0]?.total ?? 0),
        inactivatedThisWeek,
        newWhatsappRegistrations,
      },
      monthlyNewDonators,
      statusDistribution: statusRows.map((row) => ({
        status: row.status,
        total: Number(row.total),
      })),
      latestRegistrations: latestRegistrations as DonatorOverview["latestRegistrations"],
    };
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<Donator>,
  ): Promise<Donator | null> {
    const [donator] = await db
      .update(donators)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(donators.id, id), eq(donators.tenantId, tenantId)))
      .returning();

    return (donator as Donator | undefined) ?? null;
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: DonatorStatus,
  ): Promise<Donator | null> {
    return this.update(id, tenantId, { status });
  }

  async updateLastCollectionDate(
    id: string,
    tenantId: string,
    date: Date,
  ): Promise<Donator | null> {
    return this.update(id, tenantId, { lastCollectionDate: date });
  }
}

export class DrizzleDonatorClinicalHistoryRepository
  implements DonatorClinicalHistoryRepository
{
  async createOrUpdate(
    donatorId: string,
    tenantId: string,
    data: UpsertDonatorClinicalHistoryData,
  ): Promise<DonatorClinicalHistory> {
    const [donator] = await db
      .select({ id: donators.id })
      .from(donators)
      .where(and(eq(donators.id, donatorId), eq(donators.tenantId, tenantId)))
      .limit(1);

    if (!donator) {
      throw new Error("Donator not found");
    }

    const [clinicalHistory] = await db
      .insert(donatorClinicalHistories)
      .values({ donatorId, ...data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: donatorClinicalHistories.donatorId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();

    return clinicalHistory as DonatorClinicalHistory;
  }
}

export class DrizzleDonatorExamsRepository implements DonatorExamsRepository {
  async create(
    data: CreateDonatorExamData,
    tenantId: string,
  ): Promise<DonatorExam> {
    const [donator] = await db
      .select({ id: donators.id })
      .from(donators)
      .where(
        and(
          eq(donators.id, data.donatorId),
          eq(donators.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (!donator) {
      throw new Error("Donator not found");
    }

    const [exam] = await db.insert(donatorExams).values(data).returning();
    return exam as DonatorExam;
  }

  async findLatestByDonatorId(
    donatorId: string,
    tenantId: string,
  ): Promise<DonatorExam | null> {
    const [exam] = await db
      .select()
      .from(donatorExams)
      .innerJoin(donators, eq(donators.id, donatorExams.donatorId))
      .where(
        and(
          eq(donatorExams.donatorId, donatorId),
          eq(donators.tenantId, tenantId),
        ),
      )
      .orderBy(desc(donatorExams.createdAt))
      .limit(1);

    return (exam?.donator_exams as DonatorExam | undefined) ?? null;
  }

  async findManyByDonatorId(
    donatorId: string,
    tenantId: string,
  ): Promise<DonatorExam[]> {
    const exams = await db
      .select()
      .from(donatorExams)
      .innerJoin(donators, eq(donators.id, donatorExams.donatorId))
      .where(
        and(
          eq(donatorExams.donatorId, donatorId),
          eq(donators.tenantId, tenantId),
        ),
      )
      .orderBy(desc(donatorExams.examDate));

    return exams.map((row) => row.donator_exams as DonatorExam);
  }

  async findExpiredExams(tenantId: string): Promise<DonatorExam[]> {
    const exams = await db
      .select()
      .from(donatorExams)
      .innerJoin(donators, eq(donators.id, donatorExams.donatorId))
      .where(
        and(lt(donatorExams.validUntil, new Date()), eq(donators.tenantId, tenantId)),
      );

    return exams.map((row) => row.donator_exams as DonatorExam);
  }
}
