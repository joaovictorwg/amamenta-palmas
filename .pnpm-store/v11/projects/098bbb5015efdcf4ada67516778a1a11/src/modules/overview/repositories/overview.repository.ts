export type OverviewData = {
  metrics: {
    totalDonations: number;
    validDonations: number;
    expiringSoonDonations: number;
    periodVolumeMl: number;
  };
  alerts: {
    expiredDonations: number;
    pendingTriage: number;
    todayVisits: number;
    pendingExams: number;
    inactiveRisk: number;
  };
  donationStatusDistribution: { status: string; total: number }[];
  monthlyNewDonators: { month: string; total: number }[];
  monthlyCollectedVolume: { month: string; volumeMl: number }[];
};

export interface OverviewRepository {
  getOverview(tenantId: string): Promise<OverviewData>;
}
