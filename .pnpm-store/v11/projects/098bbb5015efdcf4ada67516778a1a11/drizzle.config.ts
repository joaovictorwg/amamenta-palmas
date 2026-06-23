import "dotenv/config";
import { defineConfig } from "drizzle-kit";

console.log("DB URL:", process.env.DATABASE_URL);

export default defineConfig({
  out: "./drizzle",
  schema: "./src/shared/database/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
