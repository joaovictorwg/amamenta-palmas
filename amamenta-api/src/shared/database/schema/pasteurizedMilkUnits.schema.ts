import { pgTable, uuid, integer, timestamp, text, pgEnum } from "drizzle-orm/pg-core";
import { PasteurizedMilkStockStatus } from "@/modules/donation/enums/pasteurizedMilkStatusStock.enum";

// Enum mapping for Drizzle
export const pasteurizedMilkStockStatusEnum = pgEnum("pasteurized_milk_stock_status", [
    "AVAILABLE",
    "DISTRIBUTED",
    "EXPIRED",
    "DISCARDED",
]);

export const pasteurizedMilkUnits = pgTable("pasteurized_milk_units", {
    id: uuid("id").primaryKey().defaultRandom(),
    batchId: uuid("batch_id").notNull(),
    volumeMl: integer("volume_ml").notNull(),
    expirationDate: timestamp("expiration_date", { withTimezone: true }).notNull(),
    stockStatus: pasteurizedMilkStockStatusEnum("stock_status").notNull(),
    distributedAt: timestamp("distributed_at", { withTimezone: true }),
    discardReason: text("discard_reason"),
    recipientIdentifier: text("recipient_identifier"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});