export type DonationOverviewData = {
  metrics: {
    rawMilkPendingTriage: number;
    rawMilkWaitingBatch: number;
    pasteurizationPending: number;
    availableStockMl: number;
  };
  alerts: {
    rawMilkExpired: number;
    rawMilkExpiringSoon: number;
    rejectedTriage: number;
    pasteurizedExpiringSoon: number;
    pasteurizedExpired: number;
  };
  rawMilkTriageDistribution: { status: string; total: number }[];
  rawMilkStorageDistribution: { status: string; total: number }[];
  pasteurizedStockDistribution: { status: string; total: number; volumeMl: number }[];
  monthlyCollectedVolume: { month: string; volumeMl: number }[];
  monthlyPasteurizedVolume: { month: string; volumeMl: number }[];
};

export interface DonationOverviewRepository {
  getOverview(tenantId: string): Promise<DonationOverviewData>;
}
