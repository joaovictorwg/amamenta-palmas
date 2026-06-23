import { GetDonatorsRequestDTO } from "../dtos/getDonators.dto";
import { PaginationMeta } from "../dtos/pagination.dto";
import {
  Donator,
  DonatorClinicalHistory,
  DonatorExam,
  DonatorProfile,
} from "../entities/donator.entity";
import { DonatorStatus } from "../enums/donatorStatus.enum";

export type CreateDonatorData = Omit<Donator, "id" | "createdAt" | "updatedAt">;

export type DonatorOverview = {
  metrics: {
    activeDonators: number;
    pendingExams: number;
    inactivityRisk: number;
    pendingVisits: number;
  };
  alerts: {
    examsExpiringThisMonth: number;
    inactivatedThisWeek: number;
    newWhatsappRegistrations: number;
  };
  monthlyNewDonators: { month: string; total: number }[];
  statusDistribution: { status: DonatorStatus; total: number }[];
  latestRegistrations: Pick<Donator, "id" | "name" | "phone" | "status">[];
};

export interface DonatorRepository {
  create(data: CreateDonatorData): Promise<Donator>;

  findAll(params: GetDonatorsRequestDTO): Promise<{
    data: Donator[];
    meta: PaginationMeta;
  }>;

  findMany(params: GetDonatorsRequestDTO): Promise<{
    data: Donator[];
    meta: PaginationMeta;
  }>;

  findById(id: string, tenantId: string): Promise<DonatorProfile | null>;

  findByPhone(phone: string, tenantId: string): Promise<Donator | null>;

  getOverview(tenantId: string): Promise<DonatorOverview>;

  update(
    id: string,
    tenantId: string,
    data: Partial<Donator>,
  ): Promise<Donator | null>;

  updateStatus(
    id: string,
    tenantId: string,
    status: DonatorStatus,
  ): Promise<Donator | null>;

  updateLastCollectionDate(
    id: string,
    tenantId: string,
    date: Date,
  ): Promise<Donator | null>;

  delete(id: string, tenantId: string): Promise<void>;
}

export type UpsertDonatorClinicalHistoryData = Partial<
  Omit<DonatorClinicalHistory, "id" | "donatorId" | "createdAt" | "updatedAt">
>;

export interface DonatorClinicalHistoryRepository {
  createOrUpdate(
    donatorId: string,
    tenantId: string,
    data: UpsertDonatorClinicalHistoryData,
  ): Promise<DonatorClinicalHistory>;
}

export type CreateDonatorExamData = Omit<
  DonatorExam,
  "id" | "createdAt" | "updatedAt"
>;

export interface DonatorExamsRepository {
  create(data: CreateDonatorExamData, tenantId: string): Promise<DonatorExam>;
  findLatestByDonatorId(
    donatorId: string,
    tenantId: string,
  ): Promise<DonatorExam | null>;
  findManyByDonatorId(
    donatorId: string,
    tenantId: string,
  ): Promise<DonatorExam[]>;
  findExpiredExams(tenantId: string): Promise<DonatorExam[]>;
}
