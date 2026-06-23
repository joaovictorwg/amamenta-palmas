import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { tenants } from "./tenant.schema";

export const invites = pgTable(
  "invites",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    email: text("email").notNull(),

    // 🔥 role que será criada
    role: text("role", {
      enum: ["admin", "employee"],
    }).notNull(),

    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
      }),

    // 🔥 token único
    token: text("token").notNull(),

    // 🔥 controle de uso
    used: boolean("used").notNull().default(false),

    expiresAt: timestamp("expires_at").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      tokenUnique: uniqueIndex("invites_token_unique").on(table.token),
    };
  }
);