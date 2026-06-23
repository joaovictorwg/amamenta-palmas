import { Visit, VisitWithDonator } from "../entities/visit.entity";
import { VisitStatus, VisitType } from "../enums/visit.enum";

export type CreateVisitData = {
  tenantId: string;
  donatorId: string;
  type: VisitType;
  scheduledAt?: Date | null;
  needsKit?: boolean;
  observations?: string | null;
  createdBy?: string | null;
};

export type UpdateVisitData = Partial<
  Pick<
    Visit,
    | "type"
    | "status"
    | "scheduledAt"
    | "needsKit"
    | "zipCode"
    | "address"
    | "addressNumber"
    | "neighborhood"
    | "city"
    | "state"
    | "observations"
  >
>;

export type ListVisitsParams = {
  tenantId: string;
  status?: VisitStatus;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
};

export interface VisitRepository {
  create(data: CreateVisitData): Promise<Visit>;

  findMany(params: ListVisitsParams): Promise<{
    data: VisitWithDonator[];
    total: number;
  }>;

  findById(id: string, tenantId: string): Promise<VisitWithDonator | null>;

  update(id: string, tenantId: string, data: UpdateVisitData): Promise<Visit>;

  updateStatus(
    id: string,
    tenantId: string,
    status: VisitStatus,
  ): Promise<Visit>;
}
