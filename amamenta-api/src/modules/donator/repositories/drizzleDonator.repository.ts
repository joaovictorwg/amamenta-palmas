import { and, count, desc, eq, ilike, lt } from "drizzle-orm";

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
