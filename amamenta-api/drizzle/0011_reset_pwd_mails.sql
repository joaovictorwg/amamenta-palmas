CREATE TABLE "reset_pwd_mails" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "email" text NOT NULL,
  "token" text NOT NULL,
  "used" boolean DEFAULT false NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "reset_pwd_mails" ADD CONSTRAINT "reset_pwd_mails_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "reset_pwd_mails_token_unique" ON "reset_pwd_mails" USING btree ("token");--> statement-breakpoint
CREATE INDEX "reset_pwd_mails_user_id_idx" ON "reset_pwd_mails" USING btree ("user_id");
