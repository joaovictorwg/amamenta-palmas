import { seed } from "./seed";

seed()
  .then(() => {
    console.log("🌱 Seed finished");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  });