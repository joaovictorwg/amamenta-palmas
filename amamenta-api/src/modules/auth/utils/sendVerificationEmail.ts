import { env } from "@/shared/config/env";
import { MailProvider } from "@/shared/mail/mail.provider";
import { signEmailVerificationToken } from "@/shared/utils/jwt";
import { buildVerifyEmailMessage } from "./buildVerifyEmailMessage";

interface Params {
    mailProvider: MailProvider;
    userId: string;
    email: string;
}

export async function sendVerificationEmail({
    mailProvider,
    userId,
    email,
}: Params) {
    const verificationToken = signEmailVerificationToken({
        sub: userId,
        email,
        purpose: "email_verification",
    });

    const verificationUrl = `${env.appBaseUrl}/verify-email?token=${verificationToken}`;
    const message = buildVerifyEmailMessage({ verificationUrl });

    await mailProvider.send({
        to: email,
        subject: message.subject,
        html: message.html,
        text: message.text,
    });
}