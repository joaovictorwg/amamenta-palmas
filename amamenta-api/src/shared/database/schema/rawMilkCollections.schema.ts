import { pgTable, uuid, timestamp, integer, text, pgEnum } from "drizzle-orm/pg-core";
import { RawMilkTriageStatus } from "@/modules/donation/enums/rawMilkTriageStatus.enum";
import { RawMilkStorageStatus } from "@/modules/donation/enums/rawMilkStorageStatus.enum";

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
    donorId: uuid("donor_id").notNull(),
    visitId: uuid("visit_id"),
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
});