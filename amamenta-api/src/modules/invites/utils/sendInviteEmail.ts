import { MailProvider } from "@/shared/mail/mail.provider";
import { buildInviteEmailMessage } from "./buildInviteEmailMessage";

interface Params {
    mailProvider: MailProvider;
    email: string;
    token: string;
    role: "admin" | "employee";
    tenantName: string;
}

export async function sendInviteEmail({
    mailProvider,
    email,
    token,
    role,
    tenantName,
}: Params) {
    const message = buildInviteEmailMessage({ role, tenantName, token });

    await mailProvider.send({
        to: email,
        subject: message.subject,
        html: message.html,
        text: message.text,
    });
}