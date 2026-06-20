import { BadRequestError } from "@/shared/errors/BadRequestError";
import { ConflictError } from "@/shared/errors/ConflictError";
import { Donator } from "../../entities/donator.entity";
import { DonatorStatus } from "../../enums/donatorStatus.enum";
import { DonatorRepository } from "../../repositories/donator.repository";

interface CreateDonatorRequest {
  registrationNumber?: string;
  registeredAt?: Date;
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  referencePoint?: string;
  birthDate?: string;
  babyName?: string;
  naturality?: string;
  homeCollection?: boolean;
  exclusiveDonator?: boolean;
  receptor?: DonatorReceptor;
  receptorOther?: string;
  guidanceSource?: DonatorGuidanceSource;
  guidanceSourceOther?: string;
  registeredBy?: string;
  tenantId?: string;
}

export class CreateDonatorUseCase {
  constructor(private donatorRepository: DonatorRepository) {}

  async execute(data: CreateDonatorRequest): Promise<Donator> {
    if (!data.tenantId) {
      throw new BadRequestError("Hospital nao informado");
    }

    const existingDonator = await this.donatorRepository.findByPhone(
      data.phone,
      data.tenantId,
    );

    if (existingDonator) {
      throw new ConflictError("Telefone ja cadastrado");
    }

    return this.donatorRepository.create({
      ...data,
      registrationNumber: data.registrationNumber ?? null,
      registeredAt: data.registeredAt ?? null,
      referencePoint: data.referencePoint ?? null,
      birthDate: data.birthDate ?? null,
      babyName: data.babyName ?? null,
      naturality: data.naturality ?? null,
      homeCollection: data.homeCollection ?? false,
      exclusiveDonator: data.exclusiveDonator ?? false,
      receptor: data.receptor ?? null,
      receptorOther: data.receptorOther ?? null,
      guidanceSource: data.guidanceSource ?? null,
      guidanceSourceOther: data.guidanceSourceOther ?? null,
      registeredBy: data.registeredBy ?? null,
      userId: null,
      tenantId: data.tenantId,
      status: DonatorStatus.PENDING_EXAMS,
      lastCollectionDate: null,
    });
  }
}
import {
  DonatorGuidanceSource,
  DonatorReceptor,
} from "../../enums/donatorForm.enum";
