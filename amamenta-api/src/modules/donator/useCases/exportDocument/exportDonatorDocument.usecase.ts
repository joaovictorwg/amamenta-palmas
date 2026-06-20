import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { AppError } from "@/shared/errors/AppError";
import { DonatorGuidanceSource } from "../../enums/donatorForm.enum";
import { ExamResult } from "../../enums/examResult.enum";
import { GetDonatorByIdUseCase } from "../getDonator/getDonator.usecase";

interface ExportDonatorDocumentResult {
  filename: string;
  buffer: Buffer;
}

const TEMPLATE_PATH = join(
  process.cwd(),
  "src",
  "modules",
  "donator",
  "templates",
  "donator-registration-template.docx",
);

function formatDate(value?: Date | string | null): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

function sanitizeFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function mark(checked: boolean): string {
  return checked ? "X" : "";
}

function yes(checked?: boolean | null): string {
  return mark(Boolean(checked));
}

function no(checked?: boolean | null): string {
  return mark(!checked);
}

function exam(result: ExamResult | undefined, expected: ExamResult): string {
  return mark(result === expected);
}

function loadTemplateEngine() {
  const PizZip = require("pizzip");
  const Docxtemplater = require("docxtemplater");

  return { PizZip, Docxtemplater };
}

export class ExportDonatorDocumentUseCase {
  constructor(private getDonatorProfileUseCase: GetDonatorByIdUseCase) {}

  async execute(
    id: string,
    tenantId: string,
  ): Promise<ExportDonatorDocumentResult> {
    if (!existsSync(TEMPLATE_PATH)) {
      throw new AppError(
        "Template de cadastro de doadora nao encontrado",
        500,
      );
    }

    const donator = await this.getDonatorProfileUseCase.execute(id, tenantId);
    const clinicalHistory = donator.clinicalHistory;
    const latestExam = donator.latestExam;
    const { PizZip, Docxtemplater } = loadTemplateEngine();

    const template = readFileSync(TEMPLATE_PATH, "binary");
    const zip = new PizZip(template);
    const document = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => "",
    });

    document.render({
      registrationNumber: donator.registrationNumber,
      registeredAt: formatDate(donator.registeredAt),
      name: donator.name,
      birthDate: formatDate(donator.birthDate),
      babyName: donator.babyName,
      naturality: donator.naturality,
      profession: clinicalHistory?.profession,
      maritalStatus: clinicalHistory?.maritalStatus,
      address: donator.address,
      neighborhood: donator.neighborhood,
      referencePoint: donator.referencePoint,
      city: donator.city,
      state: donator.state,
      phone: donator.phone,
      homeCollectionYes: yes(donator.homeCollection),
      homeCollectionNo: no(donator.homeCollection),
      exclusiveDonatorYes: yes(donator.exclusiveDonator),
      exclusiveDonatorNo: no(donator.exclusiveDonator),
      receptorUtin: mark(donator.receptor === "UTIN"),
      receptorUcinco: mark(donator.receptor === "UCINCO"),
      receptorCristoRei: mark(donator.receptor === "CRISTO_REI"),
      receptorOther: donator.receptorOther,
      guidanceHmdr: mark(donator.guidanceSource === DonatorGuidanceSource.HMDR),
      guidanceUsf: mark(donator.guidanceSource === DonatorGuidanceSource.USF),
      guidanceMedia: mark(
        donator.guidanceSource === DonatorGuidanceSource.MEDIA,
      ),
      guidanceOther: donator.guidanceSourceOther,
      prenatalPublic: mark(clinicalHistory?.prenatalType === "PUBLIC"),
      prenatalPrivate: mark(clinicalHistory?.prenatalType === "PRIVATE"),
      prenatalNotDone: mark(!clinicalHistory?.prenatalType),
      prenatalLocation: clinicalHistory?.prenatalLocation,
      breastfeedingGuidanceYes: yes(
        clinicalHistory?.receivedBreastfeedingGuidance,
      ),
      breastfeedingGuidanceNo: no(
        clinicalHistory?.receivedBreastfeedingGuidance,
      ),
      firstChildYes: yes(clinicalHistory?.isFirstChild),
      firstChildNo: no(clinicalHistory?.isFirstChild),
      breastfedLastChildYes: yes(clinicalHistory?.breastfedLastChild),
      breastfedLastChildNo: no(clinicalHistory?.breastfedLastChild),
      breastfedLastChildDuration:
        clinicalHistory?.breastfedLastChildDuration,
      deliveryNormal: mark(clinicalHistory?.deliveryType === "VAGINAL"),
      deliveryCesarean: mark(clinicalHistory?.deliveryType === "CESAREAN"),
      birthWeightGrams: clinicalHistory?.birthWeightGrams,
      gestationalAgeInitialWeeks:
        clinicalHistory?.gestationalAgeInitialWeeks,
      gestationalAgeFinalWeeks: clinicalHistory?.gestationalAgeFinalWeeks,
      gestationalAgeDays: clinicalHistory?.gestationalAgeDays,
      deliveryDate: formatDate(clinicalHistory?.deliveryDate),
      pregnancyWeightKg: clinicalHistory?.pregnancyWeightKg,
      heightMeters: clinicalHistory?.heightMeters,
      pregnancyIntercurrencesCid10:
        clinicalHistory?.pregnancyIntercurrencesCid10,
      vdrlReactive: exam(latestExam?.vdrl, ExamResult.REACTIVE),
      vdrlNonReactive: exam(latestExam?.vdrl, ExamResult.NON_REACTIVE),
      vdrlUnavailable: exam(latestExam?.vdrl, ExamResult.UNAVAILABLE),
      hbsagReactive: exam(latestExam?.hbsag, ExamResult.REACTIVE),
      hbsagNonReactive: exam(latestExam?.hbsag, ExamResult.NON_REACTIVE),
      hbsagUnavailable: exam(latestExam?.hbsag, ExamResult.UNAVAILABLE),
      ftaabsReactive: exam(latestExam?.ftaabs, ExamResult.REACTIVE),
      ftaabsNonReactive: exam(latestExam?.ftaabs, ExamResult.NON_REACTIVE),
      ftaabsUnavailable: exam(latestExam?.ftaabs, ExamResult.UNAVAILABLE),
      hivReactive: exam(latestExam?.hiv, ExamResult.REACTIVE),
      hivNonReactive: exam(latestExam?.hiv, ExamResult.NON_REACTIVE),
      hivUnavailable: exam(latestExam?.hiv, ExamResult.UNAVAILABLE),
      hbPercentage: latestExam?.hbPercentage,
      htPercentage: latestExam?.htPercentage,
      examDate: formatDate(latestExam?.examDate),
      bloodTransfusionYes: yes(
        clinicalHistory?.hadBloodTransfusionLastFiveYears,
      ),
      bloodTransfusionNo: no(
        clinicalHistory?.hadBloodTransfusionLastFiveYears,
      ),
      pregnancyIntercurrence1: "",
      pregnancyIntercurrence2: "",
      smokerYes: yes(clinicalHistory?.isSmoker),
      smokerNo: no(clinicalHistory?.isSmoker),
      cigarettesPerDay: clinicalHistory?.cigarettesPerDay,
      alcoholYes: yes(clinicalHistory?.usesAlcohol),
      alcoholNo: no(clinicalHistory?.usesAlcohol),
      medication: mark(Boolean(clinicalHistory?.usesMedication)),
      drugs: mark(Boolean(clinicalHistory?.usesDrugs)),
      substanceUseDescription: clinicalHistory?.substanceUseDescription,
      substanceUseAbuse: mark(
        clinicalHistory?.substanceUseClassification === "ABUSE",
      ),
      substanceUseNone: mark(
        clinicalHistory?.substanceUseClassification === "NONE",
      ),
      registeredBy: donator.registeredBy,
      medicalArea: clinicalHistory?.medicalArea,
      declaredFitYes: yes(clinicalHistory?.declaredFit),
      declaredFitNo: no(clinicalHistory?.declaredFit),
      observations: clinicalHistory?.observations,
    });

    const buffer = document.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    return {
      filename: `cadastro-doadora-${sanitizeFilename(donator.name)}.docx`,
      buffer,
    };
  }
}
