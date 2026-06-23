export interface SendMailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export interface MailProvider {
    send(params: SendMailParams): Promise<void>;
}