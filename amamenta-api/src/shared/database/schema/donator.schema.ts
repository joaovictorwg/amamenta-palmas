import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const donators = pgTable("donators", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

  phone: text("phone").notNull(),

  address: text("address").notNull(),

  status: text("status", {
    enum: ["active", "inactive"],
  })
    .notNull()
    .default("active"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});
