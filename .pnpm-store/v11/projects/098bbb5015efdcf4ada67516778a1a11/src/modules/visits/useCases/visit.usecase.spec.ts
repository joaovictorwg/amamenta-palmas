import { FakeDonatorRepository } from "@/modules/donator/tests/fakeDonatorRepository";
import { DonatorStatus } from "@/modules/donator/enums/donatorStatus.enum";
import { NotFoundError } from "@/shared/errors/NotFoundError";
import { Visit } from "../entities/visit.entity";
import { VisitStatus, VisitType } from "../enums/visit.enum";
import {
  CreateVisitData,
  ListVisitsParams,
  UpdateVisitData,
  VisitRepository,
} from "../repositories/visit.repository";
import { CreateVisitUseCase } from "./visit.usecase";

class FakeVisitRepository implements VisitRepository {
  public visits: Visit[] = [];

  async create(data: CreateVisitData): Promise<Visit> {
    const visit: Visit = {
      id: crypto.randomUUID(),
      status: VisitStatus.SCHEDULED,
      needsKit: false,
      scheduledAt: null,
      observations: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    this.visits.push(visit);
    return visit;
  }

  async findMany(_params: ListVisitsParams) {
    return { data: [], total: 0 };
  }

  async findById() {
    return null;
  }

  async update(_id: string, _tenantId: string, data: UpdateVisitData) {
    return { ...this.visits[0], ...data };
  }

  async updateStatus(_id: string, _tenantId: string, status: VisitStatus) {
    return { ...this.visits[0], status };
  }
}

describe("CreateVisitUseCase", () => {
  it("creates a delivery visit with kit when the donator belongs to the tenant", async () => {
    const tenantId = crypto.randomUUID();
    const donatorRepository = new FakeDonatorRepository();
    const visitRepository = new FakeVisitRepository();
    const useCase = new CreateVisitUseCase(visitRepository, donatorRepository);
    const donator = await donatorRepository.create({
      tenantId,
      name: "Maria",
      phone: "63999999999",
      address: "Rua 1",
      neighborhood: "Centro",
      city: "Palmas",
      state: "TO",
      homeCollection: true,
      exclusiveDonator: false,
      status: DonatorStatus.ACTIVE,
      registeredAt: null,
      registrationNumber: null,
      userId: null,
      referencePoint: null,
      birthDate: null,
      babyName: null,
      naturality: null,
      receptor: null,
      receptorOther: null,
      guidanceSource: null,
      guidanceSourceOther: null,
      registeredBy: null,
      lastCollectionDate: null,
    });

    const visit = await useCase.execute({
      tenantId,
      donatorId: donator.id,
      type: VisitType.DELIVERY,
    });

    expect(visit.needsKit).toBe(true);
    expect(visit.status).toBe(VisitStatus.SCHEDULED);
  });

  it("rejects visits for missing donators", async () => {
    const useCase = new CreateVisitUseCase(
      new FakeVisitRepository(),
      new FakeDonatorRepository(),
    );

    await expect(
      useCase.execute({
        tenantId: crypto.randomUUID(),
        donatorId: crypto.randomUUID(),
        type: VisitType.COLLECTION,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
