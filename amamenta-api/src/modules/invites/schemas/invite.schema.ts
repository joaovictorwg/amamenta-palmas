import { tenants } from "@/shared/database/schema";
import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const invites = pgTable("invites", {
    id: uuid("id").primaryKey().defaultRandom(),

    email: text("email").notNull(),

    role: text("role", {
        enum: ["admin", "employee"],
    }).notNull(),

    tenantId: uuid("tenant_id")
        .notNull()
        .references(() => tenants.id),

    token: text("token").notNull().unique(),

    used: boolean("used").notNull().default(false),

    expiresAt: timestamp("expires_at").notNull(),

    createdAt: timestamp("created_at").defaultNow(),
});