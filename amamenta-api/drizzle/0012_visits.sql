CREATE TYPE "public"."visit_type" AS ENUM('DELIVERY', 'COLLECTION');--> statement-breakpoint
CREATE TYPE "public"."visit_status" AS ENUM('SCHEDULED', 'COMPLETED', 'CANCELED');--> statement-breakpoint
CREATE TABLE "visits" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL,
  "donator_id" uuid NOT NULL,
  "type" "visit_type" NOT NULL,
  "status" "visit_status" DEFAULT 'SCHEDULED' NOT NULL,
  "scheduled_at" timestamp with time zone,
  "needs_kit" boolean DEFAULT false NOT NULL,
  "observations" text,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_donator_id_donators_id_fk" FOREIGN KEY ("donator_id") REFERENCES "public"."donators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_milk_collections" ADD CONSTRAINT "raw_milk_collections_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "visits_tenant_status_idx" ON "visits" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "visits_tenant_scheduled_idx" ON "visits" USING btree ("tenant_id","scheduled_at");--> statement-breakpoint
CREATE INDEX "visits_tenant_donator_idx" ON "visits" USING btree ("tenant_id","donator_id");
