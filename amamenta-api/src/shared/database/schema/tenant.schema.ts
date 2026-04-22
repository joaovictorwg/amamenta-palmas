import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: text("name").notNull(),

  domain: text("domain").notNull().unique(),

  autoJoinByDomain: boolean("auto_join_by_domain")
    .notNull()
    .default(false),

  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});