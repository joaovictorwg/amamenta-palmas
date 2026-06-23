import { and, count, eq, gte, lt, lte, notInArray, sql, sum } from "drizzle-orm";

import { DonatorStatus } from "@/modules/donator/enums/donatorStatus.enum";
import { RawMilkStorageStatus } from "@/modules/donation/enums/rawMilkStorageStatus.enum";
import { RawMilkTriageStatus } from "@/modules/donation/enums/rawMilkTriageStatus.enum";
import { VisitStatus } from "@/modules/visits/enums/visit.enum";
import { db } from "@/shared/database/connection";
import { donators, rawMilkCollections, visits } from "@/shared/database/schema";
import { OverviewData, OverviewRepository } from "./overview.repository";

export class DrizzleOverviewRepository implements OverviewRepository {
  async getOverview(tenantId: string): Promise<OverviewData> {
    const now = new Date();
    const expiringLimit = new Date(now);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const todayStart = new Date(now);
    const tomorrowStart = new Date(now);
    const inactiveRiskDate = new Date(now);

    expiringLimit.setDate(now.getDate() + 3);
    todayStart.setHours(0, 0, 0, 0);
    tomorrowStart.setHours(24, 0, 0, 0);
    inactiveRiskDate.setDate(now.getDate() - 50);

    const registrationDate = sql<Date>`coalesce(${donators.registeredAt}, ${donators.createdAt})`;
    const registrationMonth = sql<number>`extract(month from ${registrationDate})::int`;
    const collectionMonth = sql<number>`extract(month from ${rawMilkCollections.collectionDate})::int`;

    const usableStorageStatuses = [
      RawMilkStorageStatus.STORED,
      RawMilkStorageStatus.WAITING_BATCH,
      RawMilkStorageStatus.USED_IN_BATCH,
    ];

    const countRawMilk = async (
      whereClause: ReturnType<typeof and>,
    ): Promise<number> => {
      const [row] = await db
        .select({ total: count() })
        .from(rawMilkCollections)
        .where(whereClause);

      return Number(row.total);
    };

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
      totalDonations,
      validDonations,
      expiringSoonDonations,
      expiredDonations,
      pendingTriage,
      periodVolumeRows,
      todayVisitsRows,
      pendingExams,
      inactiveRisk,
      triageRows,
      expiredRows,
      monthlyDonatorRows,
      monthlyVolumeRows,
    ] = await Promise.all([
      countRawMilk(eq(rawMilkCollections.tenantId, tenantId)),
      countRawMilk(
        and(
          eq(rawMilkCollections.tenantId, tenantId),
          gte(rawMilkCollections.expirationDate, now),
          notInArray(rawMilkCollections.storageStatus, [
            RawMilkStorageStatus.EXPIRED,
            RawMilkStorageStatus.DISCARDED,
          ]),
        ),
      ),
      countRawMilk(
        and(
          eq(rawMilkCollections.tenantId, tenantId),
          gte(rawMilkCollections.expirationDate, now),
          lte(rawMilkCollections.expirationDate, expiringLimit),
          notInArray(rawMilkCollections.storageStatus, [
            RawMilkStorageStatus.EXPIRED,
            RawMilkStorageStatus.DISCARDED,
          ]),
        ),
      ),
      countRawMilk(
        and(
          eq(rawMilkCollections.tenantId, tenantId),
          lt(rawMilkCollections.expirationDate, now),
          notInArray(rawMilkCollections.storageStatus, [
            RawMilkStorageStatus.EXPIRED,
            RawMilkStorageStatus.DISCARDED,
          ]),
        ),
      ),
      countRawMilk(
        and(
          eq(rawMilkCollections.tenantId, tenantId),
          eq(rawMilkCollections.triageStatus, RawMilkTriageStatus.PENDING),
        ),
      ),
      db
        .select({ total: sum(rawMilkCollections.volumeMl) })
        .from(rawMilkCollections)
        .where(
          and(
            eq(rawMilkCollections.tenantId, tenantId),
            gte(rawMilkCollections.collectionDate, monthStart),
          ),
        ),
      db
        .select({ total: count() })
        .from(visits)
        .where(
          and(
            eq(visits.tenantId, tenantId),
            eq(visits.status, VisitStatus.SCHEDULED),
            gte(visits.scheduledAt, todayStart),
            lt(visits.scheduledAt, tomorrowStart),
          ),
        ),
      countDonators(
        and(
          eq(donators.tenantId, tenantId),
          eq(donators.status, DonatorStatus.PENDING_EXAMS),
        ),
      ),
      countDonators(
        and(
          eq(donators.tenantId, tenantId),
          eq(donators.status, DonatorStatus.ACTIVE),
          lt(donators.lastCollectionDate, inactiveRiskDate),
        ),
      ),
      db
        .select({ status: rawMilkCollections.triageStatus, total: count() })
        .from(rawMilkCollections)
        .where(eq(rawMilkCollections.tenantId, tenantId))
        .groupBy(rawMilkCollections.triageStatus),
      db
        .select({ total: count() })
        .from(rawMilkCollections)
        .where(
          and(
            eq(rawMilkCollections.tenantId, tenantId),
            lt(rawMilkCollections.expirationDate, now),
            notInArray(rawMilkCollections.storageStatus, usableStorageStatuses),
          ),
        ),
      db
        .select({ month: registrationMonth, total: count() })
        .from(donators)
        .where(and(eq(donators.tenantId, tenantId), gte(registrationDate, yearStart)))
        .groupBy(registrationMonth),
      db
        .select({ month: collectionMonth, volumeMl: sum(rawMilkCollections.volumeMl) })
        .from(rawMilkCollections)
        .where(
          and(
            eq(rawMilkCollections.tenantId, tenantId),
            gte(rawMilkCollections.collectionDate, yearStart),
          ),
        )
        .groupBy(collectionMonth),
    ]);

    const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
    const months = Array.from({ length: 12 }, (_, index) =>
      monthFormatter.format(new Date(now.getFullYear(), index, 1)).replace(".", ""),
    );

    return {
      metrics: {
        totalDonations,
        validDonations,
        expiringSoonDonations,
        periodVolumeMl: Number(periodVolumeRows[0]?.total ?? 0),
      },
      alerts: {
        expiredDonations,
        pendingTriage,
        todayVisits: Number(todayVisitsRows[0]?.total ?? 0),
        pendingExams,
        inactiveRisk,
      },
      donationStatusDistribution: [
        ...triageRows.map((row) => ({
          status: row.status,
          total: Number(row.total),
        })),
        { status: "EXPIRED", total: Number(expiredRows[0]?.total ?? 0) },
      ],
      monthlyNewDonators: months.map((month, index) => ({
        month,
        total: Number(monthlyDonatorRows.find((row) => Number(row.month) === index + 1)?.total ?? 0),
      })),
      monthlyCollectedVolume: months.map((month, index) => ({
        month,
        volumeMl: Number(monthlyVolumeRows.find((row) => Number(row.month) === index + 1)?.volumeMl ?? 0),
      })),
    };
  }
}
