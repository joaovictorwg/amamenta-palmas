import { Donator } from "../entities/donator.entity";
import { DonatorRepository } from "../repositories/donator.repository";

export class FakeDonatorRepository implements DonatorRepository {
  private donators: Donator[] = [];

  async create(data: Omit<Donator, "id">): Promise<Donator> {
    const donator: Donator = {
      id: crypto.randomUUID(),
      ...data,
    };

    this.donators.push(donator);
    return donator;
  }

  async findAll(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async findById(id: string): Promise<Donator | null> {
    return this.donators.find((d) => d.id === id) || null;
  }

  async update(id: string, data: Partial<Donator>): Promise<Donator> {
    const index = this.donators.findIndex((d) => d.id === id);

    if (index === -1) {
      throw new Error("Donator not found");
    }

    this.donators[index] = {
      ...this.donators[index],
      ...data,
    };

    return this.donators[index];
  }

  async delete(id: string): Promise<void> {
    this.donators = this.donators.filter((d) => d.id !== id);
  }
}
