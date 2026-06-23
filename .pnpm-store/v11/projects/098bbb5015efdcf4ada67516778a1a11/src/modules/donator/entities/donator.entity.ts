import { DonatorStatus } from "../enums/donatorStatus.enum";
import { ExamResult } from "../enums/examResult.enum";
import {
  DonatorGuidanceSource,
  DonatorReceptor,
  SubstanceUseClassification,
} from "../enums/donatorForm.enum";

export {
  DonatorGuidanceSource,
  DonatorReceptor,
  DonatorStatus,
  ExamResult,
  SubstanceUseClassification,
};

export interface Donator {
  id: string;
  userId?: string | null;
  tenantId: string;
  registrationNumber?: string | null;
  registeredAt?: Date | null;
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  referencePoint?: string | null;
  birthDate?: string | null;
  babyName?: string | null;
  naturality?: string | null;
  homeCollection: boolean;
  exclusiveDonator: boolean;
  receptor?: DonatorReceptor | null;
  receptorOther?: string | null;
  guidanceSource?: DonatorGuidanceSource | null;
  guidanceSourceOther?: string | null;
  registeredBy?: string | null;
  status: DonatorStatus;
  lastCollectionDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DonatorClinicalHistory {
  id: string;
  donatorId: string;
  profession?: string | null;
  maritalStatus?: string | null;
  prenatalType?: "PUBLIC" | "PRIVATE" | null;
  prenatalLocation?: string | null;
  receivedBreastfeedingGuidance?: boolean | null;
  isFirstChild?: boolean | null;
  breastfedLastChild?: boolean | null;
  breastfedLastChildDuration?: string | null;
  deliveryType?: "VAGINAL" | "CESAREAN" | null;
  birthWeightGrams?: number | null;
  gestationalAgeInitialWeeks?: number | null;
  gestationalAgeFinalWeeks?: number | null;
  gestationalAgeDays?: number | null;
  deliveryDate?: string | null;
  pregnancyWeightKg?: string | null;
  heightMeters?: string | null;
  pregnancyIntercurrencesCid10?: string | null;
  isSmoker?: boolean | null;
  cigarettesPerDay?: number | null;
  usesAlcohol?: boolean | null;
  usesDrugs?: boolean | null;
  usesMedication?: boolean | null;
  substanceUseDescription?: string | null;
  substanceUseClassification?: SubstanceUseClassification | null;
  hadBloodTransfusionLastFiveYears?: boolean | null;
  medicalArea?: string | null;
  declaredFit?: boolean | null;
  observations?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DonatorExam {
  id: string;
  donatorId: string;
  examDate: Date;
  validUntil: Date;
  vdrl: ExamResult;
  hbsag: ExamResult;
  ftaabs: ExamResult;
  hiv: ExamResult;
  hbPercentage?: string | null;
  htPercentage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DonatorProfile extends Donator {
  clinicalHistory: DonatorClinicalHistory | null;
  latestExam: DonatorExam | null;
}
