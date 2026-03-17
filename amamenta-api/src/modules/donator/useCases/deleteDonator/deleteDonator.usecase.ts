import { DonatorRepository } from "../repositories/donator.repository";

export class DeleteDonatorUseCase {
  constructor(private repository: DonatorRepository) {}

  async execute(id: string) {
    return this.repository.delete(id);
  }
}
