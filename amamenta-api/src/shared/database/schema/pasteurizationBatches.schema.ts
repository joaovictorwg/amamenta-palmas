import { pgTable, uuid, varchar, timestamp, text, pgEnum } from "drizzle-orm/pg-core";
import { MicrobiologyStatus } from "@/modules/donation/enums/MicrobiologyStatus.enum";

// Enum mapping for Drizzle
export const microbiologyStatusEnum = pgEnum("microbiology_status", [
    "PENDING",
    "APPROVED",
    "REJECTED",
]);

export const pasteurizationBatches = pgTable("pasteurization_batches", {
    id: uuid("id").primaryKey().defaultRandom(),
    batchCode: varchar("batch_code", { length: 32 }).notNull(),
    pasteurizedAt: timestamp("pasteurized_at", { withTimezone: true }).notNull(),
    operatorId: uuid("operator_id").notNull(),
    microbiologyStatus: microbiologyStatusEnum("microbiology_status").notNull(),
    observations: text("observations"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});