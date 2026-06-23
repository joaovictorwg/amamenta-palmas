import { VisitStatus, VisitType } from "../enums/visit.enum";

export interface Visit {
  id: string;
  tenantId: string;
  donatorId: string;
  type: VisitType;
  status: VisitStatus;
  scheduledAt?: Date | null;
  needsKit: boolean;
  zipCode?: string | null;
  address?: string | null;
  addressNumber?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  observations?: string | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type VisitWithDonator = Visit & {
  donatorName: string | null;
  donatorPhone: string | null;
  donatorAddress: string | null;
  donatorNeighborhood: string | null;
  donatorCity: string | null;
};
