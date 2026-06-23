import { MailProvider, SendMailParams } from "@/shared/mail/mail.provider";

export class FakeMailProvider implements MailProvider {
    public sent: SendMailParams[] = [];
    public shouldFail = false;

    async send(params: SendMailParams): Promise<void> {
        if (this.shouldFail) {
            throw new Error("Mail send failed");
        }

        this.sent.push(params);
    }
}
