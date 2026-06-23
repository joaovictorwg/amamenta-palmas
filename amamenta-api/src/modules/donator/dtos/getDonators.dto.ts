import { PaginationMeta, PaginationParams } from "./pagination.dto";
import { DonatorStatus } from "../enums/donatorStatus.enum";

export interface GetDonatorsRequestDTO extends PaginationParams {
  tenantId: string;
  name?: string;
  city?: string;
  status?: DonatorStatus;
  pendingExams?: boolean;
}
