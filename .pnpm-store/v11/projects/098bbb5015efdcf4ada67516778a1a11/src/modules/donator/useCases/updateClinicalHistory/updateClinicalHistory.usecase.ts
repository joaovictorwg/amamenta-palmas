import { NotFoundError } from "@/shared/errors/NotFoundError";
import {
  DonatorClinicalHistoryRepository,
  DonatorRepository,
  UpsertDonatorClinicalHistoryData,
} from "../../repositories/donator.repository";

type UpdateDonatorClinicalHistoryData = Omit<
  UpsertDonatorClinicalHistoryData,
  "pregnancyWeightKg" | "heightMeters"
> & {
  pregnancyWeightKg?: string | number | null;
  heightMeters?: string | number | null;
};

export class UpdateDonatorClinicalHistoryUseCase {
  constructor(
    private donatorRepository: DonatorRepository,
    private clinicalHistoryRepository: DonatorClinicalHistoryRepository,
  ) {}

  async execute(
    donatorId: string,
    tenantId: string,
    data: UpdateDonatorClinicalHistoryData,
  ) {
    const donator = await this.donatorRepository.findById(donatorId, tenantId);

    if (!donator) {
      throw new NotFoundError("Doadora");
    }

    return this.clinicalHistoryRepository.createOrUpdate(
      donatorId,
      tenantId,
      {
        ...data,
        pregnancyWeightKg:
          data.pregnancyWeightKg === undefined
            ? undefined
            : String(data.pregnancyWeightKg),
        heightMeters:
          data.heightMeters === undefined
            ? undefined
            : String(data.heightMeters),
      },
    );
  }
}
