CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"tenant_id" uuid,
	"is_verified" boolean DEFAULT false NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_secret" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"tenant_id" uuid NOT NULL,
	"token" text NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "employees" DROP CONSTRAINT "employees_email_unique";--> statement-breakpoint
ALTER TABLE "donators" DROP CONSTRAINT "donators_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "donators" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "password" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "domain" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "invites_token_unique" ON "invites" USING btree ("token");--> statement-breakpoint
ALTER TABLE "donators" ADD CONSTRAINT "donators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donators" ADD CONSTRAINT "donators_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "donator_phone_tenant_unique" ON "donators" USING btree ("phone","tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "employees_tenant_email_unique" ON "employees" USING btree ("tenant_id","email");--> statement-breakpoint
CREATE INDEX "employees_tenant_idx" ON "employees" USING btree ("tenant_id");--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_domain_unique" UNIQUE("domain");