import { env } from "@/shared/config/env";
import { MailProvider } from "@/shared/mail/mail.provider";

interface Params {
  mailProvider: MailProvider;
  email: string;
  token: string;
}

export async function sendResetPasswordEmail({
  mailProvider,
  email,
  token,
}: Params) {
  const resetUrl = `${env.appBaseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  await mailProvider.send({
    to: email,
    subject: "Recuperacao de senha",
    html: `<p>Para redefinir sua senha, clique <a href="${resetUrl}">aqui</a>.</p>`,
    text: `Para redefinir sua senha, acesse: ${resetUrl}`,
  });
}
