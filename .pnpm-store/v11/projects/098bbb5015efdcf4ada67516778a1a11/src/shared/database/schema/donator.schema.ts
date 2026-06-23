import {
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { DonatorStatus } from "@/modules/donator/enums/donatorStatus.enum";
import { ExamResult } from "@/modules/donator/enums/examResult.enum";
import {
  DonatorGuidanceSource,
  DonatorReceptor,
  SubstanceUseClassification,
} from "@/modules/donator/enums/donatorForm.enum";
import { tenants } from "./tenant.schema";
import { users } from "./user.schema";

export const donatorStatusEnum = pgEnum("donator_status", [
  DonatorStatus.PENDING_EXAMS,
  DonatorStatus.ACTIVE,
  DonatorStatus.INACTIVE,
]);

export const examResultEnum = pgEnum("donator_exam_result", [
  ExamResult.NON_REACTIVE,
  ExamResult.REACTIVE,
  ExamResult.UNAVAILABLE,
]);

export const donatorReceptorEnum = pgEnum("donator_receptor", [
  DonatorReceptor.UTIN,
  DonatorReceptor.UCINCO,
  DonatorReceptor.CRISTO_REI,
  DonatorReceptor.OTHER,
]);

export const donatorGuidanceSourceEnum = pgEnum("donator_guidance_source", [
  DonatorGuidanceSource.HMDR,
  DonatorGuidanceSource.USF,
  DonatorGuidanceSource.MEDIA,
  DonatorGuidanceSource.OTHER,
]);

export const substanceUseClassificationEnum = pgEnum(
  "substance_use_classification",
  [SubstanceUseClassification.ABUSE, SubstanceUseClassification.NONE],
);

export const donators = pgTable(
  "donators",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    registrationNumber: text("registration_number"),
    registeredAt: timestamp("registered_at", { withTimezone: true }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    neighborhood: text("neighborhood").notNull().default(""),
    city: text("city").notNull().default(""),
    state: text("state").notNull().default("TO"),
    referencePoint: text("reference_point"),
    birthDate: date("birth_date"),
    babyName: text("baby_name"),
    naturality: text("naturality"),
    homeCollection: boolean("home_collection").notNull().default(false),
    exclusiveDonator: boolean("exclusive_donator").notNull().default(false),
    receptor: donatorReceptorEnum("receptor"),
    receptorOther: text("receptor_other"),
    guidanceSource: donatorGuidanceSourceEnum("guidance_source"),
    guidanceSourceOther: text("guidance_source_other"),
    registeredBy: text("registered_by"),
    status: donatorStatusEnum("status")
      .notNull()
      .default(DonatorStatus.PENDING_EXAMS),
    lastCollectionDate: timestamp("last_collection_date", {
      withTimezone: true,
    }),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
      }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    phoneTenantUnique: uniqueIndex("donator_phone_tenant_unique").on(
      table.phone,
      table.tenantId,
    ),
  }),
);

export const donatorClinicalHistories = pgTable(
  "donator_clinical_histories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    donatorId: uuid("donator_id")
      .notNull()
      .references(() => donators.id, { onDelete: "cascade" }),
    profession: text("profession"),
    maritalStatus: text("marital_status"),
    prenatalType: text("prenatal_type", { enum: ["PUBLIC", "PRIVATE"] }),
    prenatalLocation: text("prenatal_location"),
    receivedBreastfeedingGuidance: boolean("received_breastfeeding_guidance"),
    isFirstChild: boolean("is_first_child"),
    breastfedLastChild: boolean("breastfed_last_child"),
    breastfedLastChildDuration: text("breastfed_last_child_duration"),
    deliveryType: text("delivery_type", { enum: ["VAGINAL", "CESAREAN"] }),
    birthWeightGrams: integer("birth_weight_grams"),
    gestationalAgeInitialWeeks: integer("gestational_age_initial_weeks"),
    gestationalAgeFinalWeeks: integer("gestational_age_final_weeks"),
    gestationalAgeDays: integer("gestational_age_days"),
    deliveryDate: date("delivery_date"),
    pregnancyWeightKg: numeric("pregnancy_weight_kg", {
      precision: 5,
      scale: 2,
    }),
    heightMeters: numeric("height_meters", { precision: 3, scale: 2 }),
    pregnancyIntercurrencesCid10: text("pregnancy_intercurrences_cid10"),
    isSmoker: boolean("is_smoker"),
    cigarettesPerDay: integer("cigarettes_per_day"),
    usesAlcohol: boolean("uses_alcohol"),
    usesDrugs: boolean("uses_drugs"),
    usesMedication: boolean("uses_medication"),
    substanceUseDescription: text("substance_use_description"),
    substanceUseClassification: substanceUseClassificationEnum(
      "substance_use_classification",
    ),
    hadBloodTransfusionLastFiveYears: boolean(
      "had_blood_transfusion_last_five_years",
    ),
    medicalArea: text("medical_area"),
    declaredFit: boolean("declared_fit"),
    observations: text("observations"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    donatorIdUnique: uniqueIndex(
      "donator_clinical_histories_donator_id_unique",
    ).on(table.donatorId),
  }),
);

export const donatorExams = pgTable(
  "donator_exams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    donatorId: uuid("donator_id")
      .notNull()
      .references(() => donators.id, { onDelete: "cascade" }),
    examDate: timestamp("exam_date", { withTimezone: true }).notNull(),
    validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
    vdrl: examResultEnum("vdrl").notNull(),
    hbsag: examResultEnum("hbsag").notNull(),
    ftaabs: examResultEnum("ftaabs").notNull(),
    hiv: examResultEnum("hiv").notNull(),
    hbPercentage: numeric("hb_percentage", { precision: 5, scale: 2 }),
    htPercentage: numeric("ht_percentage", { precision: 5, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    donatorIdIdx: index("donator_exams_donator_id_idx").on(table.donatorId),
    validUntilIdx: index("donator_exams_valid_until_idx").on(table.validUntil),
    examDateIdx: index("donator_exams_exam_date_idx").on(table.examDate),
    validUntilAfterExamDate: check(
      "donator_exams_valid_until_after_exam_date_check",
      sql`${table.validUntil} >= ${table.examDate}`,
    ),
  }),
);
