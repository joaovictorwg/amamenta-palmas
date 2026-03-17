import { AppError } from "@/shared/errors/AppError";
import { FastifyInstance } from "fastify";

export async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: true,
        message: error.message,
      });
    }

    request.log.error(error);

    return reply.status(500).send({
      error: true,
      message: "Internal server error",
    });
  });
}
