import { pgTable, uuid, primaryKey, unique } from "drizzle-orm/pg-core";

export const batchRawMilk = pgTable("batch_raw_milk", {
    batchId: uuid("batch_id").notNull(),
    rawMilkCollectionId: uuid("raw_milk_collection_id").notNull(),
}, (table) => ({
    pk: primaryKey(table.batchId, table.rawMilkCollectionId),
    uniqueRawMilk: unique("unique_raw_milk").on(table.rawMilkCollectionId),
}));