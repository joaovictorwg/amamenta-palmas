import { DonatorRepository } from "@/modules/donator/repositories/donator.repository";
import { NotFoundError } from "@/shared/errors/NotFoundError";
import { VisitStatus, VisitType } from "../enums/visit.enum";
import {
  CreateVisitData,
  ListVisitsParams,
  UpdateVisitData,
  VisitRepository,
} from "../repositories/visit.repository";

export class CreateVisitUseCase {
  constructor(
    private visitRepository: VisitRepository,
    private donatorRepository: DonatorRepository,
  ) {}

  async execute(data: CreateVisitData) {
    const donator = await this.donatorRepository.findById(
      data.donatorId,
      data.tenantId,
    );

    if (!donator) {
      throw new NotFoundError("Doadora");
    }

    return this.visitRepository.create({
      ...data,
      needsKit: data.needsKit ?? data.type === VisitType.DELIVERY,
    });
  }
}

export class RequestVisitUseCase {
  constructor(
    private visitRepository: VisitRepository,
    private donatorRepository: DonatorRepository,
  ) {}

  async execute(data: { tenantId: string; phone: string; type: VisitType }) {
    const donator = await this.donatorRepository.findByPhone(
      data.phone.replace(/\D/g, ""),
      data.tenantId,
    );

    if (!donator) {
      return null;
    }

    return this.visitRepository.create({
      tenantId: data.tenantId,
      donatorId: donator.id,
      type: data.type,
      needsKit: data.type === VisitType.DELIVERY,
      observations: "Solicitada pela doadora.",
      createdBy: null,
    });
  }
}

export class ListVisitsUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(params: ListVisitsParams) {
    return this.visitRepository.findMany(params);
  }
}

export class UpdateVisitUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(id: string, tenantId: string, data: UpdateVisitData) {
    return this.visitRepository.update(id, tenantId, data);
  }
}

export class UpdateVisitStatusUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(id: string, tenantId: string, status: VisitStatus) {
    return this.visitRepository.updateStatus(id, tenantId, status);
  }
}
