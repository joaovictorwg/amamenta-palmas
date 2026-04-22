export type DonatorStatus = "active" | "inactive";

export interface Donator {
  id: string;

  userId?: string | null; // opcional

  name: string;
  phone: string;
  address: string;

  status: DonatorStatus;

  tenantId: string; // hospital

  createdAt: Date;
}