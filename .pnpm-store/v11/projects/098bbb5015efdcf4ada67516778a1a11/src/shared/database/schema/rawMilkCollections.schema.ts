import { pgTable, uuid, timestamp, integer, text, pgEnum, index } from "drizzle-orm/pg-core";
import { RawMilkTriageStatus } from "@/modules/donation/enums/rawMilkTriageStatus.enum";
import { RawMilkStorageStatus } from "@/modules/donation/enums/rawMilkStorageStatus.enum";
import { tenants } from "./tenant.schema";
import { visits } from "./visit.schema";

// Enum mapping for Drizzle
export const triageStatusEnum = pgEnum("raw_milk_triage_status", [
    "PENDING",
    "APPROVED",
    "REJECTED",
]);
export const storageStatusEnum = pgEnum("raw_milk_storage_status", [
    "STORED",
    "WAITING_BATCH",
    "USED_IN_BATCH",
    "EXPIRED",
    "DISCARDED",
]);

export const rawMilkCollections = pgTable("raw_milk_collections", {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    donorId: uuid("donor_id").notNull(),
    visitId: uuid("visit_id").references(() => visits.id, { onDelete: "set null" }),
    collectionDate: timestamp("collection_date", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull(),
    volumeMl: integer("volume_ml").notNull(),
    expirationDate: timestamp("expiration_date", { withTimezone: true }).notNull(),
    triageStatus: triageStatusEnum("triage_status").notNull(),
    storageStatus: storageStatusEnum("storage_status").notNull(),
    discardReason: text("discard_reason"),
    observations: text("observations"),
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    tenantIdx: index("raw_milk_collections_tenant_id_idx").on(table.tenantId),
    tenantDonorIdx: index("raw_milk_collections_tenant_donor_idx").on(table.tenantId, table.donorId),
    tenantTriageIdx: index("raw_milk_collections_tenant_triage_idx").on(table.tenantId, table.triageStatus),
    tenantStorageIdx: index("raw_milk_collections_tenant_storage_idx").on(table.tenantId, table.storageStatus),
}));
