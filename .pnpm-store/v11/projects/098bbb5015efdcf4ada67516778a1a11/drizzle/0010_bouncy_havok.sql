ALTER TABLE "pasteurization_batches" ADD COLUMN "tenant_id" uuid;--> statement-breakpoint
ALTER TABLE "pasteurized_milk_units" ADD COLUMN "tenant_id" uuid;--> statement-breakpoint
ALTER TABLE "raw_milk_collections" ADD COLUMN "tenant_id" uuid;--> statement-breakpoint
UPDATE "raw_milk_collections"
SET "tenant_id" = "donators"."tenant_id"
FROM "donators"
WHERE "raw_milk_collections"."donor_id" = "donators"."id";--> statement-breakpoint
UPDATE "pasteurization_batches"
SET "tenant_id" = "batch_tenants"."tenant_id"
FROM (
  SELECT
    "batch_raw_milk"."batch_id",
    min("raw_milk_collections"."tenant_id"::text)::uuid AS "tenant_id",
    count(DISTINCT "raw_milk_collections"."tenant_id") AS "tenant_count"
  FROM "batch_raw_milk"
  INNER JOIN "raw_milk_collections"
    ON "batch_raw_milk"."raw_milk_collection_id" = "raw_milk_collections"."id"
  GROUP BY "batch_raw_milk"."batch_id"
) AS "batch_tenants"
WHERE "pasteurization_batches"."id" = "batch_tenants"."batch_id"
  AND "batch_tenants"."tenant_count" = 1;--> statement-breakpoint
UPDATE "pasteurized_milk_units"
SET "tenant_id" = "pasteurization_batches"."tenant_id"
FROM "pasteurization_batches"
WHERE "pasteurized_milk_units"."batch_id" = "pasteurization_batches"."id";--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "raw_milk_collections" WHERE "tenant_id" IS NULL) THEN
    RAISE EXCEPTION 'raw_milk_collections.tenant_id backfill failed';
  END IF;

  IF EXISTS (SELECT 1 FROM "pasteurization_batches" WHERE "tenant_id" IS NULL) THEN
    RAISE EXCEPTION 'pasteurization_batches.tenant_id backfill failed';
  END IF;

  IF EXISTS (SELECT 1 FROM "pasteurized_milk_units" WHERE "tenant_id" IS NULL) THEN
    RAISE EXCEPTION 'pasteurized_milk_units.tenant_id backfill failed';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "pasteurization_batches" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pasteurized_milk_units" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "raw_milk_collections" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pasteurization_batches" ADD CONSTRAINT "pasteurization_batches_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pasteurized_milk_units" ADD CONSTRAINT "pasteurized_milk_units_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_milk_collections" ADD CONSTRAINT "raw_milk_collections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pasteurization_batches_tenant_id_idx" ON "pasteurization_batches" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pasteurization_batches_tenant_microbiology_idx" ON "pasteurization_batches" USING btree ("tenant_id","microbiology_status");--> statement-breakpoint
CREATE INDEX "pasteurization_batches_tenant_operator_idx" ON "pasteurization_batches" USING btree ("tenant_id","operator_id");--> statement-breakpoint
CREATE INDEX "pasteurized_milk_units_tenant_id_idx" ON "pasteurized_milk_units" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pasteurized_milk_units_tenant_batch_idx" ON "pasteurized_milk_units" USING btree ("tenant_id","batch_id");--> statement-breakpoint
CREATE INDEX "pasteurized_milk_units_tenant_stock_idx" ON "pasteurized_milk_units" USING btree ("tenant_id","stock_status");--> statement-breakpoint
CREATE INDEX "raw_milk_collections_tenant_id_idx" ON "raw_milk_collections" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "raw_milk_collections_tenant_donor_idx" ON "raw_milk_collections" USING btree ("tenant_id","donor_id");--> statement-breakpoint
CREATE INDEX "raw_milk_collections_tenant_triage_idx" ON "raw_milk_collections" USING btree ("tenant_id","triage_status");--> statement-breakpoint
CREATE INDEX "raw_milk_collections_tenant_storage_idx" ON "raw_milk_collections" USING btree ("tenant_id","storage_status");
