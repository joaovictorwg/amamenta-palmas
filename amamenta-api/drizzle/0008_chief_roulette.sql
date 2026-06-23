CREATE TYPE "public"."donator_guidance_source" AS ENUM('HMDR', 'USF', 'MEDIA', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."donator_receptor" AS ENUM('UTIN', 'UCINCO', 'CRISTO_REI', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."donator_status" AS ENUM('PENDING_EXAMS', 'ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."donator_exam_result" AS ENUM('NON_REACTIVE', 'REACTIVE', 'UNAVAILABLE');--> statement-breakpoint
CREATE TYPE "public"."substance_use_classification" AS ENUM('ABUSE', 'NONE');--> statement-breakpoint
CREATE TYPE "public"."microbiology_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."pasteurized_milk_stock_status" AS ENUM('AVAILABLE', 'DISTRIBUTED', 'EXPIRED', 'DISCARDED');--> statement-breakpoint
CREATE TYPE "public"."raw_milk_storage_status" AS ENUM('STORED', 'WAITING_BATCH', 'USED_IN_BATCH', 'EXPIRED', 'DISCARDED');--> statement-breakpoint
CREATE TYPE "public"."raw_milk_triage_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "batch_raw_milk" (
	"batch_id" uuid NOT NULL,
	"raw_milk_collection_id" uuid NOT NULL,
	CONSTRAINT "batch_raw_milk_batch_id_raw_milk_collection_id_pk" PRIMARY KEY("batch_id","raw_milk_collection_id"),
	CONSTRAINT "unique_raw_milk" UNIQUE("raw_milk_collection_id")
);
--> statement-breakpoint
CREATE TABLE "donator_clinical_histories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"donator_id" uuid NOT NULL,
	"profession" text,
	"marital_status" text,
	"prenatal_type" text,
	"prenatal_location" text,
	"received_breastfeeding_guidance" boolean,
	"is_first_child" boolean,
	"breastfed_last_child" boolean,
	"breastfed_last_child_duration" text,
	"delivery_type" text,
	"birth_weight_grams" integer,
	"gestational_age_initial_weeks" integer,
	"gestational_age_final_weeks" integer,
	"gestational_age_days" integer,
	"delivery_date" date,
	"pregnancy_weight_kg" numeric(5, 2),
	"height_meters" numeric(3, 2),
	"pregnancy_intercurrences_cid10" text,
	"is_smoker" boolean,
	"cigarettes_per_day" integer,
	"uses_alcohol" boolean,
	"uses_drugs" boolean,
	"uses_medication" boolean,
	"substance_use_description" text,
	"substance_use_classification" "substance_use_classification",
	"had_blood_transfusion_last_five_years" boolean,
	"medical_area" text,
	"declared_fit" boolean,
	"observations" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donator_exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"donator_id" uuid NOT NULL,
	"exam_date" timestamp with time zone NOT NULL,
	"valid_until" timestamp with time zone NOT NULL,
	"vdrl" "donator_exam_result" NOT NULL,
	"hbsag" "donator_exam_result" NOT NULL,
	"ftaabs" "donator_exam_result" NOT NULL,
	"hiv" "donator_exam_result" NOT NULL,
	"hb_percentage" numeric(5, 2),
	"ht_percentage" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "donator_exams_valid_until_after_exam_date_check" CHECK ("donator_exams"."valid_until" >= "donator_exams"."exam_date")
);
--> statement-breakpoint
CREATE TABLE "pasteurization_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_code" varchar(32) NOT NULL,
	"pasteurized_at" timestamp with time zone NOT NULL,
	"operator_id" uuid NOT NULL,
	"microbiology_status" "microbiology_status" NOT NULL,
	"observations" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pasteurized_milk_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"volume_ml" integer NOT NULL,
	"expiration_date" timestamp with time zone NOT NULL,
	"stock_status" "pasteurized_milk_stock_status" NOT NULL,
	"distributed_at" timestamp with time zone,
	"discard_reason" text,
	"recipient_identifier" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raw_milk_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"donor_id" uuid NOT NULL,
	"visit_id" uuid,
	"collection_date" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone NOT NULL,
	"volume_ml" integer NOT NULL,
	"expiration_date" timestamp with time zone NOT NULL,
	"triage_status" "raw_milk_triage_status" NOT NULL,
	"storage_status" "raw_milk_storage_status" NOT NULL,
	"discard_reason" text,
	"observations" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "donators" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "donators" ALTER COLUMN "status" SET DATA TYPE "public"."donator_status" USING (
	CASE
		WHEN "status" = 'active' THEN 'ACTIVE'
		WHEN "status" = 'inactive' THEN 'INACTIVE'
		ELSE 'PENDING_EXAMS'
	END
)::"public"."donator_status";--> statement-breakpoint
ALTER TABLE "donators" ALTER COLUMN "status" SET DEFAULT 'PENDING_EXAMS'::"public"."donator_status";--> statement-breakpoint
ALTER TABLE "donators" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "donators" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "registration_number" text;--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "registered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "neighborhood" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "city" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "state" text DEFAULT 'TO' NOT NULL;--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "reference_point" text;--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "birth_date" date;--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "baby_name" text;--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "naturality" text;--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "home_collection" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "exclusive_donator" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "receptor" "donator_receptor";--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "receptor_other" text;--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "guidance_source" "donator_guidance_source";--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "guidance_source_other" text;--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "registered_by" text;--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "last_collection_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "donator_clinical_histories" ADD CONSTRAINT "donator_clinical_histories_donator_id_donators_id_fk" FOREIGN KEY ("donator_id") REFERENCES "public"."donators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donator_exams" ADD CONSTRAINT "donator_exams_donator_id_donators_id_fk" FOREIGN KEY ("donator_id") REFERENCES "public"."donators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "donator_clinical_histories_donator_id_unique" ON "donator_clinical_histories" USING btree ("donator_id");--> statement-breakpoint
CREATE INDEX "donator_exams_donator_id_idx" ON "donator_exams" USING btree ("donator_id");--> statement-breakpoint
CREATE INDEX "donator_exams_valid_until_idx" ON "donator_exams" USING btree ("valid_until");--> statement-breakpoint
CREATE INDEX "donator_exams_exam_date_idx" ON "donator_exams" USING btree ("exam_date");
