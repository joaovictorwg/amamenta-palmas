import { AppError } from "@/shared/errors/AppError";
import { FastifyInstance } from "fastify";


export async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: any, request, reply) => {
    let message = error.message;
    // Se a mensagem for uma chave i18n, traduz
    if (message && message.startsWith('i18n:')) {
      message = request.t(message.replace('i18n:', ''));
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
      message: request.t('errors.internal_server_error'),
    });
  });
}
