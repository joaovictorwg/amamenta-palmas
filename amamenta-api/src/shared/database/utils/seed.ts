import { db } from "../connection";
import { users } from "../schema/user.schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../../utils/hash";
import { env } from "../../config/env";

export async function seed() {
  console.log("🌱 Running seed...");

  const email = env.SUPER_ADMIN_EMAIL;
  const password = env.SUPER_ADMIN_PASSWORD;
  const passwordHash = await hashPassword(password!);
  if (!email || !password) {
    throw new Error("Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD in env");
  }

  // 🔍 verifica se já existe
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existing.length > 0) {
    console.log("⚠️ Super admin already exists");
    return;
  }

 

  // 🧱 cria usuário
  await db.insert(users).values({
    email,
    passwordHash,
    role: "super_admin",
    tenantId: null,
    isVerified: true,
    twoFactorEnabled: false,
  });

  console.log("✅ Super admin created");
}