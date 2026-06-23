import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { VisitStatus, VisitType } from "@/modules/visits/enums/visit.enum";
import { donators } from "./donator.schema";
import { tenants } from "./tenant.schema";
import { users } from "./user.schema";

export const visitTypeEnum = pgEnum("visit_type", [
  VisitType.DELIVERY,
  VisitType.COLLECTION,
]);

export const visitStatusEnum = pgEnum("visit_status", [
  VisitStatus.SCHEDULED,
  VisitStatus.COMPLETED,
  VisitStatus.CANCELED,
]);

export const visits = pgTable(
  "visits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    donatorId: uuid("donator_id")
      .notNull()
      .references(() => donators.id, { onDelete: "cascade" }),
    type: visitTypeEnum("type").notNull(),
    status: visitStatusEnum("status").notNull().default(VisitStatus.SCHEDULED),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    needsKit: boolean("needs_kit").notNull().default(false),
    zipCode: text("zip_code"),
    address: text("address"),
    addressNumber: text("address_number"),
    neighborhood: text("neighborhood"),
    city: text("city"),
    state: text("state"),
    observations: text("observations"),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantStatusIdx: index("visits_tenant_status_idx").on(
      table.tenantId,
      table.status,
    ),
    tenantScheduledIdx: index("visits_tenant_scheduled_idx").on(
      table.tenantId,
      table.scheduledAt,
    ),
    tenantDonatorIdx: index("visits_tenant_donator_idx").on(
      table.tenantId,
      table.donatorId,
    ),
  }),
);
