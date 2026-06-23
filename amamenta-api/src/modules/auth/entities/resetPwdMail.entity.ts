export interface ResetPwdMail {
  id: string;
  userId: string;
  email: string;
  token: string;
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
}
