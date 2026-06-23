interface Params {
    verificationUrl: string;
}

export function buildVerifyEmailMessage({ verificationUrl }: Params) {
    const subject = "Confirme seu email";
    const text = [
        "Bem-vindo(a)!",
        "",
        "Para ativar sua conta, confirme seu email no link abaixo:",
        verificationUrl,
    ].join("\n");

    const html = [
        "<h2>Bem-vindo(a)!</h2>",
        "<p>Para ativar sua conta, confirme seu email no link abaixo:</p>",
        `<p><a href=\"${verificationUrl}\">Confirmar email</a></p>`,
    ].join("");

    return {
        subject,
        text,
        html,
    };
}