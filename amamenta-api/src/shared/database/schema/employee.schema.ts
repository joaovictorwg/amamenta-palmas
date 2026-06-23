import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenant.schema";
import { index } from "drizzle-orm/pg-core";

export const employees = pgTable(
  "employees",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),

    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),

    role: text("role").notNull(), // depois tipar melhor

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => {
    return {
      tenantEmailUnique: uniqueIndex("employees_tenant_email_unique").on(
        table.tenantId,
        table.email,
      ),
      tenantIndex: index("employees_tenant_idx").on(table.tenantId),
    };
  },
);

 