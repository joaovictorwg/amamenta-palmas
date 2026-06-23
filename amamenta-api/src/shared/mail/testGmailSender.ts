import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS?.replace(/"/g, ''), // remove quotes if present
    },
});

export async function enviarCodigoVerificacao(emailUsuario: string, codigo: string) {
    const mailOptions = {
        from: `"Meu Aplicativo" <${process.env.EMAIL_USER}>`,
        to: emailUsuario,
        subject: '🔒 Seu Código de Verificação',
        text: `Seu código de acesso é: ${codigo}`,
        html: `<b>Seu código de acesso é: <span style="font-size: 20px;">${codigo}</span></b>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('E-mail enviado com sucesso: ' + info.messageId);
        return info;
    } catch (error) {
        console.error('Erro ao enviar e-mail: ', error);
        throw error;
    }
}

// Teste rápido (remova ou comente em produção)
if (require.main === module) {
    enviarCodigoVerificacao('destinatario@gmail.com', '123456');
}
