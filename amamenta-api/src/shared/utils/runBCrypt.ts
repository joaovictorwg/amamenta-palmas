// Exemplo de como usar no seu controller ou service

import { comparePassword, hashPassword } from "./hash";


async function executarExemplo() {
    const senhaDigitada = "JoaoWgiani061221#@";

    // --- FLUXO DE CADASTRO ---
    console.log("Criptografando senha para o banco de dados...");
    const senhaHasheada = await hashPassword(senhaDigitada);

    // No mundo real, você salvaria 'senhaHasheada' no seu banco (Supabase, Postgres, etc.)
    console.log("Hash gerado:", senhaHasheada);

    // --- FLUXO DE LOGIN ---
    console.log("\nSimulando tentativa de login...");

    const senhaFornecidaNoLogin = "JoaoWgiani061221#@";
    const ehValida = await comparePassword(senhaFornecidaNoLogin, senhaHasheada);

    if (ehValida) {
        console.log("✅ Login realizado com sucesso!");
    } else {
        console.log("❌ Senha incorreta.");
    }
}

executarExemplo();