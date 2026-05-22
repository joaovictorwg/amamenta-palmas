import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { fastifySwagger } from "@fastify/swagger";
import { fastifyCors } from "@fastify/cors";
import ScalarApiReference from "@scalar/fastify-api-reference";

import { routes } from "./routes";
import { errorHandler } from "./errorHandler";
import i18next, { i18nextMiddleware } from "@/shared/i18n/i18next";

export const app = fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

// i18next middleware
app.register(i18nextMiddleware.plugin, { i18next });

// Zod validation
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// CORS
app.register(fastifyCors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

// Swagger
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Amamenta API",
      description: "API do sistema Amamenta Palmas",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

// Docs
app.register(ScalarApiReference, {
  routePrefix: "/docs",
});

// error handler
errorHandler(app);

// Rotas da aplicação
app.register(routes);
