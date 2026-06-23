import { z } from "zod";
import { SubstanceUseClassification } from "../enums/donatorForm.enum";

export const updateClinicalHistorySchema = z.object({
  profession: z.string().optional(),
  maritalStatus: z.string().optional(),
  prenatalType: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  prenatalLocation: z.string().optional(),
  receivedBreastfeedingGuidance: z.boolean().optional(),
  isFirstChild: z.boolean().optional(),
  breastfedLastChild: z.boolean().optional(),
  breastfedLastChildDuration: z.string().optional(),
  deliveryType: z.enum(["VAGINAL", "CESAREAN"]).optional(),
  birthWeightGrams: z.number().int().min(0).optional(),
  gestationalAgeInitialWeeks: z.number().int().min(0).optional(),
  gestationalAgeFinalWeeks: z.number().int().min(0).optional(),
  gestationalAgeDays: z.number().int().min(0).optional(),
  deliveryDate: z.string().optional(),
  pregnancyWeightKg: z.coerce.number().min(0).optional(),
  heightMeters: z.coerce.number().min(0).optional(),
  pregnancyIntercurrencesCid10: z.string().optional(),
  isSmoker: z.boolean().optional(),
  cigarettesPerDay: z.number().int().min(0).optional(),
  usesAlcohol: z.boolean().optional(),
  usesDrugs: z.boolean().optional(),
  usesMedication: z.boolean().optional(),
  substanceUseDescription: z.string().optional(),
  substanceUseClassification: z
    .nativeEnum(SubstanceUseClassification)
    .optional(),
  hadBloodTransfusionLastFiveYears: z.boolean().optional(),
  medicalArea: z.string().optional(),
  declaredFit: z.boolean().optional(),
  observations: z.string().optional(),
});

export type UpdateClinicalHistoryInput = z.infer<
  typeof updateClinicalHistorySchema
>;
