import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenant.schema";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name"),

    email: text("email").notNull(),

    passwordHash: text("password_hash").notNull(),

    role: text("role", {
      enum: ["super_admin", "admin", "employee"],
    }).notNull(),

    // null para super_admin
    tenantId: uuid("tenant_id").references(() => tenants.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),

    isVerified: boolean("is_verified").notNull().default(false),

    // 2FA
    twoFactorEnabled: boolean("two_factor_enabled")
      .notNull()
      .default(false),

    twoFactorSecret: text("two_factor_secret"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => {
    return {
      emailUnique: uniqueIndex("users_email_unique").on(table.email),
    };
  }
);
