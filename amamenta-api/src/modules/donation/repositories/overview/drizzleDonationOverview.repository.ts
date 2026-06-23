import { and, count, eq, gte, lt, lte, notInArray, sql, sum } from "drizzle-orm";

import { MicrobiologyStatus } from "@/modules/donation/enums/MicrobiologyStatus.enum";
import { PasteurizedMilkStockStatus } from "@/modules/donation/enums/pasteurizedMilkStatusStock.enum";
import { RawMilkStorageStatus } from "@/modules/donation/enums/rawMilkStorageStatus.enum";
import { RawMilkTriageStatus } from "@/modules/donation/enums/rawMilkTriageStatus.enum";
import { db } from "@/shared/database/connection";
import {
  pasteurizationBatches,
  pasteurizedMilkUnits,
  rawMilkCollections,
} from "@/shared/database/schema";
import {
  DonationOverviewData,
  DonationOverviewRepository,
} from "./donationOverview.repository";

export class DrizzleDonationOverviewRepository
  implements DonationOverviewRepository
{
  async getOverview(tenantId: string): Promise<DonationOverviewData> {
    const now = new Date();
    const rawMilkExpiringLimit = new Date(now);
    const pasteurizedExpiringLimit = new Date(now);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const collectionMonth = sql<number>`extract(month from ${rawMilkCollections.collectionDate})::int`;
    const pasteurizationMonth = sql<number>`extract(month from ${pasteurizationBatches.pasteurizedAt})::int`;

    rawMilkExpiringLimit.setDate(now.getDate() + 3);
    pasteurizedExpiringLimit.setDate(now.getDate() + 30);

    const countRawMilk = async (
      whereClause: ReturnType<typeof and>,
    ): Promise<number> => {
      const [row] = await db
        .select({ total: count() })
        .from(rawMilkCollections)
        .where(whereClause);

      return Number(row.total);
    };

    const [
      rawMilkPendingTriage,
      rawMilkWaitingBatch,
      pasteurizationPending,
      availableStockRows,
      rawMilkExpired,
      rawMilkExpiringSoon,
      rejectedTriage,
      pasteurizedExpiringSoon,
      pasteurizedExpired,
      triageRows,
      storageRows,
      stockRows,
      monthlyCollectedRows,
      monthlyPasteurizedRows,
    ] = await Promise.all([
      countRawMilk(
        and(
          eq(rawMilkCollections.tenantId, tenantId),
          eq(rawMilkCollections.triageStatus, RawMilkTriageStatus.PENDING),
        ),
      ),
      countRawMilk(
        and(
          eq(rawMilkCollections.tenantId, tenantId),
          eq(rawMilkCollections.triageStatus, RawMilkTriageStatus.APPROVED),
          eq(rawMilkCollections.storageStatus, RawMilkStorageStatus.WAITING_BATCH),
        ),
      ),
      db
        .select({ total: count() })
        .from(pasteurizationBatches)
        .where(
          and(
            eq(pasteurizationBatches.tenantId, tenantId),
            eq(pasteurizationBatches.microbiologyStatus, MicrobiologyStatus.PENDING),
          ),
        ),
      db
        .select({ total: sum(pasteurizedMilkUnits.volumeMl) })
        .from(pasteurizedMilkUnits)
        .where(
          and(
            eq(pasteurizedMilkUnits.tenantId, tenantId),
            eq(pasteurizedMilkUnits.stockStatus, PasteurizedMilkStockStatus.AVAILABLE),
            gte(pasteurizedMilkUnits.expirationDate, now),
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
          gte(rawMilkCollections.expirationDate, now),
          lte(rawMilkCollections.expirationDate, rawMilkExpiringLimit),
          notInArray(rawMilkCollections.storageStatus, [
            RawMilkStorageStatus.EXPIRED,
            RawMilkStorageStatus.DISCARDED,
          ]),
        ),
      ),
      countRawMilk(
        and(
          eq(rawMilkCollections.tenantId, tenantId),
          eq(rawMilkCollections.triageStatus, RawMilkTriageStatus.REJECTED),
        ),
      ),
      db
        .select({ total: count() })
        .from(pasteurizedMilkUnits)
        .where(
          and(
            eq(pasteurizedMilkUnits.tenantId, tenantId),
            eq(pasteurizedMilkUnits.stockStatus, PasteurizedMilkStockStatus.AVAILABLE),
            gte(pasteurizedMilkUnits.expirationDate, now),
            lte(pasteurizedMilkUnits.expirationDate, pasteurizedExpiringLimit),
          ),
        ),
      db
        .select({ total: count() })
        .from(pasteurizedMilkUnits)
        .where(
          and(
            eq(pasteurizedMilkUnits.tenantId, tenantId),
            lt(pasteurizedMilkUnits.expirationDate, now),
            eq(pasteurizedMilkUnits.stockStatus, PasteurizedMilkStockStatus.AVAILABLE),
          ),
        ),
      db
        .select({ status: rawMilkCollections.triageStatus, total: count() })
        .from(rawMilkCollections)
        .where(eq(rawMilkCollections.tenantId, tenantId))
        .groupBy(rawMilkCollections.triageStatus),
      db
        .select({ status: rawMilkCollections.storageStatus, total: count() })
        .from(rawMilkCollections)
        .where(eq(rawMilkCollections.tenantId, tenantId))
        .groupBy(rawMilkCollections.storageStatus),
      db
        .select({
          status: pasteurizedMilkUnits.stockStatus,
          total: count(),
          volumeMl: sum(pasteurizedMilkUnits.volumeMl),
        })
        .from(pasteurizedMilkUnits)
        .where(eq(pasteurizedMilkUnits.tenantId, tenantId))
        .groupBy(pasteurizedMilkUnits.stockStatus),
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
      db
        .select({
          month: pasteurizationMonth,
          volumeMl: sum(pasteurizedMilkUnits.volumeMl),
        })
        .from(pasteurizedMilkUnits)
        .innerJoin(
          pasteurizationBatches,
          eq(pasteurizationBatches.id, pasteurizedMilkUnits.batchId),
        )
        .where(
          and(
            eq(pasteurizationBatches.tenantId, tenantId),
            gte(pasteurizationBatches.pasteurizedAt, yearStart),
          ),
        )
        .groupBy(pasteurizationMonth),
    ]);

    const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
    const months = Array.from({ length: 12 }, (_, index) =>
      monthFormatter.format(new Date(now.getFullYear(), index, 1)).replace(".", ""),
    );

    return {
      metrics: {
        rawMilkPendingTriage,
        rawMilkWaitingBatch,
        pasteurizationPending: Number(pasteurizationPending[0]?.total ?? 0),
        availableStockMl: Number(availableStockRows[0]?.total ?? 0),
      },
      alerts: {
        rawMilkExpired,
        rawMilkExpiringSoon,
        rejectedTriage,
        pasteurizedExpiringSoon: Number(pasteurizedExpiringSoon[0]?.total ?? 0),
        pasteurizedExpired: Number(pasteurizedExpired[0]?.total ?? 0),
      },
      rawMilkTriageDistribution: triageRows.map((row) => ({
        status: row.status,
        total: Number(row.total),
      })),
      rawMilkStorageDistribution: storageRows.map((row) => ({
        status: row.status,
        total: Number(row.total),
      })),
      pasteurizedStockDistribution: stockRows.map((row) => ({
        status: row.status,
        total: Number(row.total),
        volumeMl: Number(row.volumeMl ?? 0),
      })),
      monthlyCollectedVolume: months.map((month, index) => ({
        month,
        volumeMl: Number(
          monthlyCollectedRows.find((row) => Number(row.month) === index + 1)
            ?.volumeMl ?? 0,
        ),
      })),
      monthlyPasteurizedVolume: months.map((month, index) => ({
        month,
        volumeMl: Number(
          monthlyPasteurizedRows.find((row) => Number(row.month) === index + 1)
            ?.volumeMl ?? 0,
        ),
      })),
    };
  }
}
