export type DonatorStatus = "active" | "inactive";

export interface Donator {
  id: string;
  name: string;
  phone: string;
  address: string;
  status: DonatorStatus;
  createdAt: Date;
}
