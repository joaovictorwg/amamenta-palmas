import { MailProvider } from "@/shared/mail/mail.provider";
import { env } from "@/shared/config/env";
import { signResetPasswordToken } from "@/shared/utils/jwt"; // vamos criar essa função já já

interface Params {
    mailProvider: MailProvider;
    userId: string;
    email: string;
}

export async function sendResetPasswordEmail({
    mailProvider,
    userId,
    email,
}: Params) {
    const token = signResetPasswordToken({
        sub: userId,
        email,
        purpose: "reset_password",
    });

    const resetUrl = `${env.appBaseUrl}/reset-password?token=${token}`;
    const subject = "Recuperação de senha";
    const html = `<p>Para redefinir sua senha, clique <a href="${resetUrl}">aqui</a>.</p>`;
    const text = `Para redefinir sua senha, acesse: ${resetUrl}`;

    await mailProvider.send({
        to: email,
        subject,
        html,
        text,
    });
}