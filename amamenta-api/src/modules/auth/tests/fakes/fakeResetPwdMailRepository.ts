import { ResetPwdMail } from "../../entities/resetPwdMail.entity";
import { ResetPwdMailRepository } from "../../repositories/resetPwdMail.repository";

export class FakeResetPwdMailRepository implements ResetPwdMailRepository {
  public resetPwdMails: ResetPwdMail[] = [];

  async create(
    data: Omit<ResetPwdMail, "id" | "createdAt">,
  ): Promise<ResetPwdMail> {
    const resetPwdMail: ResetPwdMail = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      ...data,
    };

    this.resetPwdMails.push(resetPwdMail);
    return resetPwdMail;
  }

  async findByToken(token: string): Promise<ResetPwdMail | null> {
    return this.resetPwdMails.find((item) => item.token === token) ?? null;
  }

  async markAsUsed(id: string): Promise<void> {
    const resetPwdMail = this.resetPwdMails.find((item) => item.id === id);

    if (resetPwdMail) {
      resetPwdMail.used = true;
    }
  }

  async delete(id: string): Promise<void> {
    this.resetPwdMails = this.resetPwdMails.filter((item) => item.id !== id);
  }
}
