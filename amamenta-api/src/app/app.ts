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

import { registerRoutes } from "./routes";

export const app = fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

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

// Rotas da aplicação
app.register(registerRoutes);
