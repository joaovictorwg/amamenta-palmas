import { SendMailParams, MailProvider } from "./mail.provider";
import { ResendProvider } from "./resend.provider";
import { NodemailerProvider } from "./nodemailer.provider";

export class EmailService implements MailProvider {
    private provider: MailProvider;

    constructor() {
        // Troque a linha abaixo para outro provider se necessário
        this.provider = new NodemailerProvider();
        // Exemplo para trocar:
        // this.provider = new ResendProvider();
    }

    async send(params: SendMailParams): Promise<void> {
        return this.provider.send(params);
    }
}
