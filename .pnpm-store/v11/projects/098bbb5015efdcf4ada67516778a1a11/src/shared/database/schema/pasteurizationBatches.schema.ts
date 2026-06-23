import { pgTable, uuid, varchar, timestamp, text, pgEnum, index } from "drizzle-orm/pg-core";
import { MicrobiologyStatus } from "@/modules/donation/enums/MicrobiologyStatus.enum";
import { tenants } from "./tenant.schema";

// Enum mapping for Drizzle
export const microbiologyStatusEnum = pgEnum("microbiology_status", [
    "PENDING",
    "APPROVED",
    "REJECTED",
]);

export const pasteurizationBatches = pgTable("pasteurization_batches", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    batchCode: varchar("batch_code", { length: 32 }).notNull(),
    pasteurizedAt: timestamp("pasteurized_at", { withTimezone: true }).notNull(),
    operatorId: uuid("operator_id").notNull(),
    microbiologyStatus: microbiologyStatusEnum("microbiology_status").notNull(),
    observations: text("observations"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    tenantIdx: index("pasteurization_batches_tenant_id_idx").on(table.tenantId),
    tenantMicrobiologyIdx: index("pasteurization_batches_tenant_microbiology_idx").on(table.tenantId, table.microbiologyStatus),
    tenantOperatorIdx: index("pasteurization_batches_tenant_operator_idx").on(table.tenantId, table.operatorId),
}));
