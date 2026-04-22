import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { tenants } from "./tenant.schema";
import { users } from "./user.schema";
 
export const donators = pgTable(
  "donators",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),

    phone: text("phone").notNull(),

    address: text("address").notNull(),

    status: text("status", {
      enum: ["active", "inactive"],
    })
      .notNull()
      .default("active"),

    // 🔥 vínculo opcional com user global
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    // 🔥 SEMPRE pertence a um hospital
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      // 🔥 evita duplicidade no mesmo hospital
      phoneTenantUnique: uniqueIndex("donator_phone_tenant_unique").on(
        table.phone,
        table.tenantId
      ),
    };
  }
);