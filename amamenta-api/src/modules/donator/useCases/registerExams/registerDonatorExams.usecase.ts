import { BadRequestError } from "@/shared/errors/BadRequestError";
import { NotFoundError } from "@/shared/errors/NotFoundError";
import { ExamResult } from "../../enums/examResult.enum";
import { DonatorStatus } from "../../enums/donatorStatus.enum";
import {
  DonatorExamsRepository,
  DonatorRepository,
} from "../../repositories/donator.repository";

interface RegisterDonatorExamsRequest {
  examDate: Date;
  vdrl: ExamResult;
  hbsag: ExamResult;
  ftaabs: ExamResult;
  hiv: ExamResult;
  hbPercentage?: number;
  htPercentage?: number;
}

export class RegisterDonatorExamsUseCase {
  constructor(
    private donatorRepository: DonatorRepository,
    private examsRepository: DonatorExamsRepository,
  ) {}

  async execute(
    donatorId: string,
    tenantId: string,
    data: RegisterDonatorExamsRequest,
  ) {
    const donator = await this.donatorRepository.findById(donatorId, tenantId);

    if (!donator) {
      throw new NotFoundError("Doadora");
    }

    if (data.examDate > new Date()) {
      throw new BadRequestError("Data de exame invalida");
    }

    const validUntil = new Date(data.examDate);
    validUntil.setUTCMonth(validUntil.getUTCMonth() + 6);

    const exam = await this.examsRepository.create(
      {
        donatorId,
        examDate: data.examDate,
        validUntil,
        vdrl: data.vdrl,
        hbsag: data.hbsag,
        ftaabs: data.ftaabs,
        hiv: data.hiv,
        hbPercentage:
          data.hbPercentage === undefined ? null : String(data.hbPercentage),
        htPercentage:
          data.htPercentage === undefined ? null : String(data.htPercentage),
      },
      tenantId,
    );

    const allNonReactive = [data.vdrl, data.hbsag, data.ftaabs, data.hiv].every(
      (result) => result === ExamResult.NON_REACTIVE,
    );

    await this.donatorRepository.updateStatus(
      donatorId,
      tenantId,
      allNonReactive ? DonatorStatus.ACTIVE : DonatorStatus.PENDING_EXAMS,
    );

    return exam;
  }
}
