import { env } from "@/shared/config/env";

interface Params {
    role: "admin" | "employee";
    tenantName: string;
    token: string;
}

export function buildInviteEmailMessage({ role, tenantName, token }: Params) {
    const roleLabel = role === "admin" ? "administrador" : "colaborador";
    const acceptUrl = `${env.appBaseUrl}/accept-invite?inviteToken=${encodeURIComponent(token)}`;
    const subject = `Convite para ${tenantName}`;
    const text = [
        `Voce recebeu um convite para entrar em ${tenantName} como ${roleLabel}.`,
        "",
        "Use o token abaixo para aceitar o convite:",
        token,
        "",
        "Se voce tiver uma pagina de aceite configurada, tambem pode abrir:",
        acceptUrl,
    ].join("\n");

    const html = [
        `<h2>Convite para ${tenantName} no Amamenta Brasil</h2>`,
        `<p>Voce recebeu um convite para entrar como <strong>${roleLabel}</strong>.</p>`,
        `<p>Token do convite:</p>`,
        `<pre style="padding:12px;border-radius:8px;background:#f1f5f9">${token}</pre>`,
        `<p><a href="${acceptUrl}">Abrir pagina de aceite</a></p>`,
    ].join("");

    return {
        subject,
        text,
        html,
    };
}
