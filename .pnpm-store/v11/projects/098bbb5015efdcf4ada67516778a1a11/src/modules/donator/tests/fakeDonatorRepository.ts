import {
  Donator,
  DonatorClinicalHistory,
  DonatorExam,
  DonatorProfile,
} from "../entities/donator.entity";
import {
  CreateDonatorData,
  CreateDonatorExamData,
  DonatorClinicalHistoryRepository,
  DonatorExamsRepository,
  DonatorOverview,
  DonatorRepository,
  UpsertDonatorClinicalHistoryData,
} from "../repositories/donator.repository";
import { DonatorStatus } from "../enums/donatorStatus.enum";

export class FakeDonatorRepository implements DonatorRepository {
  private donators: Donator[] = [];
  clinicalHistories: DonatorClinicalHistory[] = [];
  exams: DonatorExam[] = [];

  async create(data: CreateDonatorData): Promise<Donator> {
    const donator: Donator = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    this.donators.push(donator);
    return donator;
  }

  async findAll(params: any): Promise<any> {
    return this.findMany(params);
  }

  async findMany(params: any = {}): Promise<any> {
    const data = params.tenantId
      ? this.donators.filter((item) => item.tenantId === params.tenantId)
      : this.donators;

    return {
      data,
      meta: {
        page: 1,
        limit: 10,
        total: data.length,
        totalPages: 1,
      },
    };
  }

  async findById(id: string, tenantId: string): Promise<DonatorProfile | null> {
    const donator = this.donators.find(
      (item) => item.id === id && item.tenantId === tenantId,
    );

    if (!donator) {
      return null;
    }

    return {
      ...donator,
      clinicalHistory:
        this.clinicalHistories.find((item) => item.donatorId === id) ?? null,
      latestExam: this.exams.at(-1) ?? null,
    };
  }

  async findByPhone(phone: string, tenantId: string): Promise<Donator | null> {
    return (
      this.donators.find(
        (item) => item.phone === phone && item.tenantId === tenantId,
      ) ?? null
    );
  }

  async getOverview(tenantId: string): Promise<DonatorOverview> {
    const data = this.donators.filter((item) => item.tenantId === tenantId);

    return {
      metrics: {
        activeDonators: data.filter((item) => item.status === DonatorStatus.ACTIVE).length,
        pendingExams: data.filter((item) => item.status === DonatorStatus.PENDING_EXAMS).length,
        inactivityRisk: 0,
        pendingVisits: data.filter(
          (item) => item.status === DonatorStatus.PENDING_EXAMS && item.homeCollection,
        ).length,
      },
      alerts: {
        examsExpiringThisMonth: 0,
        inactivatedThisWeek: 0,
        newWhatsappRegistrations: 0,
      },
      monthlyNewDonators: [],
      statusDistribution: Object.values(DonatorStatus).map((status) => ({
        status,
        total: data.filter((item) => item.status === status).length,
      })),
      latestRegistrations: data.slice(-5).map((item) => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        status: item.status,
      })),
    };
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<Donator>,
  ): Promise<Donator | null> {
    const index = this.donators.findIndex(
      (item) => item.id === id && item.tenantId === tenantId,
    );

    if (index === -1) {
      return null;
    }

    this.donators[index] = {
      ...this.donators[index],
      ...data,
      updatedAt: new Date(),
    };

    return this.donators[index];
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

  async delete(id: string, tenantId: string): Promise<void> {
    this.donators = this.donators.filter(
      (item) => item.id !== id || item.tenantId !== tenantId,
    );
  }
}

export class FakeDonatorClinicalHistoryRepository
  implements DonatorClinicalHistoryRepository
{
  constructor(private donatorRepository: FakeDonatorRepository) {}

  async createOrUpdate(
    donatorId: string,
    tenantId: string,
    data: UpsertDonatorClinicalHistoryData,
  ): Promise<DonatorClinicalHistory> {
    const donator = await this.donatorRepository.findById(donatorId, tenantId);

    if (!donator) {
      throw new Error("Donator not found");
    }

    const existingIndex = this.donatorRepository.clinicalHistories.findIndex(
      (item) => item.donatorId === donatorId,
    );

    const clinicalHistory: DonatorClinicalHistory = {
      id:
        existingIndex >= 0
          ? this.donatorRepository.clinicalHistories[existingIndex].id
          : crypto.randomUUID(),
      donatorId,
      createdAt:
        existingIndex >= 0
          ? this.donatorRepository.clinicalHistories[existingIndex].createdAt
          : new Date(),
      updatedAt: new Date(),
      ...data,
    };

    if (existingIndex >= 0) {
      this.donatorRepository.clinicalHistories[existingIndex] = clinicalHistory;
    } else {
      this.donatorRepository.clinicalHistories.push(clinicalHistory);
    }

    return clinicalHistory;
  }
}

export class FakeDonatorExamsRepository implements DonatorExamsRepository {
  constructor(private donatorRepository: FakeDonatorRepository) {}

  async create(
    data: CreateDonatorExamData,
    tenantId: string,
  ): Promise<DonatorExam> {
    const donator = await this.donatorRepository.findById(
      data.donatorId,
      tenantId,
    );

    if (!donator) {
      throw new Error("Donator not found");
    }

    const exam: DonatorExam = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    this.donatorRepository.exams.push(exam);
    return exam;
  }

  async findLatestByDonatorId(
    donatorId: string,
    tenantId: string,
  ): Promise<DonatorExam | null> {
    const donator = await this.donatorRepository.findById(donatorId, tenantId);

    if (!donator) {
      return null;
    }

    return (
      [...this.donatorRepository.exams]
        .reverse()
        .find((item) => item.donatorId === donatorId) ?? null
    );
  }

  async findManyByDonatorId(
    donatorId: string,
    tenantId: string,
  ): Promise<DonatorExam[]> {
    const donator = await this.donatorRepository.findById(donatorId, tenantId);

    if (!donator) {
      return [];
    }

    return this.donatorRepository.exams
      .filter((item) => item.donatorId === donatorId)
      .sort((current, next) => next.examDate.getTime() - current.examDate.getTime());
  }

  async findExpiredExams(tenantId: string): Promise<DonatorExam[]> {
    const tenantDonatorIds = new Set(
      (await this.donatorRepository.findMany({ tenantId })).data.map(
        (item: Donator) => item.id,
      ),
    );

    return this.donatorRepository.exams.filter(
      (item) =>
        item.validUntil < new Date() && tenantDonatorIds.has(item.donatorId),
    );
  }
}
