import { AppError } from "@/shared/errors/AppError";
import { FastifyInstance } from "fastify";
import { t, SupportedLang } from "@/shared/i18n";

export async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: any, request, reply) => {
    // Detecta idioma do header ou usa pt
    const lang: SupportedLang = (request.headers['accept-language']?.toString().startsWith('en') ? 'en' : 'pt');

    let message = error.message;
    // Se a mensagem for uma chave i18n, traduz
    if (message && message.startsWith('i18n:')) {
      message = t(message.replace('i18n:', ''), lang);
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: true,
        message,
      });
    }

    request.log.error(error);

    return reply.status(500).send({
      error: true,
      message: t('errors.internal_server_error', lang),
    });
  });
}
