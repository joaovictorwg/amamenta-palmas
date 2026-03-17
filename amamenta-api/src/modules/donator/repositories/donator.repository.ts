import { GetDonatorsRequestDTO } from "../dtos/getDonators.dto";
import { PaginationMeta } from "../dtos/pagination.dto";
import { Donator } from "../entities/donator.entity";

export interface DonatorRepository {
  create(data: Omit<Donator, "id">): Promise<Donator>;

  findAll(params: GetDonatorsRequestDTO): Promise<{
    data: Donator[];
    meta: PaginationMeta;
  }>;

  findById(id: string): Promise<Donator | null>;

  update(id: string, data: Partial<Donator>): Promise<Donator>;

  delete(id: string): Promise<void>;
}
