import { eq } from "drizzle-orm";

import { db } from "@/shared/database/connection";
import { resetPwdMails } from "@/shared/database/schema/resetPwdMail.schema";
import { ResetPwdMail } from "../entities/resetPwdMail.entity";
import { ResetPwdMailRepository } from "./resetPwdMail.repository";

export class DrizzleResetPwdMailRepository implements ResetPwdMailRepository {
  async create(
    data: Omit<ResetPwdMail, "id" | "createdAt">,
  ): Promise<ResetPwdMail> {
    const [resetPwdMail] = await db.insert(resetPwdMails).values(data).returning();

    return resetPwdMail;
  }

  async findByToken(token: string): Promise<ResetPwdMail | null> {
    const [resetPwdMail] = await db
      .select()
      .from(resetPwdMails)
      .where(eq(resetPwdMails.token, token));

    return resetPwdMail ?? null;
  }

  async markAsUsed(id: string): Promise<void> {
    await db
      .update(resetPwdMails)
      .set({ used: true })
      .where(eq(resetPwdMails.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(resetPwdMails).where(eq(resetPwdMails.id, id));
  }
}
