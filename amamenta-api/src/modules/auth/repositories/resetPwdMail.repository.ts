import { ResetPwdMail } from "../entities/resetPwdMail.entity";

export interface ResetPwdMailRepository {
  create(data: Omit<ResetPwdMail, "id" | "createdAt">): Promise<ResetPwdMail>;

  findByToken(token: string): Promise<ResetPwdMail | null>;

  markAsUsed(id: string): Promise<void>;

  delete(id: string): Promise<void>;
}
