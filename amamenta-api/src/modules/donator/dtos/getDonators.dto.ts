import { Donator } from "../entities/donator.entity";
import { PaginationMeta, PaginationParams } from "./pagination.dto";

export interface GetDonatorsRequestDTO extends PaginationParams {
  name?: string;
  status?: "active" | "inactive";
}
