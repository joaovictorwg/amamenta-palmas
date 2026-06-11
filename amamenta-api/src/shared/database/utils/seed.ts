import { db } from "../connection";
import { users } from "../schema/user.schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../../utils/hash";
import { env } from "../../config/env";

export async function seed() {
  console.log("🌱 Running seed...");

  const email = env.SUPER_ADMIN_EMAIL;
  const password = env.SUPER_ADMIN_PASSWORD;
  console.log("🔎 Email:", email);
  console.log("🔎 Password set:", !!password);

  if (!email || !password) {
    console.error("❌ Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD in env");
    throw new Error("Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD in env");
  }

  let passwordHash;
  try {
    console.log("🔑 Hashing password...");
    passwordHash = await hashPassword(password!);
    console.log("🔑 Password hashed.");
  } catch (err) {
    console.error("❌ Error hashing password:", err);
    throw err;
  }

  // 🔍 verifica se já existe
  console.log("🔍 Checking if super admin already exists...");
  let existing;
  try {
    existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    console.log("🔍 Existing users found:", existing.length);
  } catch (err) {
    console.error("❌ Error querying users:", err);
    throw err;
  }

  if (existing.length > 0) {
    console.log("⚠️ Super admin already exists");
    return;
  }

  // 🧱 cria usuário
  try {
    console.log("🧱 Creating super admin user...");
    await db.insert(users).values({
      email,
      passwordHash,
      role: "super_admin",
      tenantId: null,
      isVerified: true,
    });
    console.log("✅ Super admin created");
  } catch (err) {
    console.error("❌ Error creating super admin:", err);
    throw err;
  }
}