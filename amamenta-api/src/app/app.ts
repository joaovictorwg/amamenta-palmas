import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { donationsRoutes } from "@/modules/donation/routes/donations.routes";

import { fastifySwagger } from "@fastify/swagger";
import { fastifyCors } from "@fastify/cors";
import ScalarApiReference from "@scalar/fastify-api-reference";

import { routes } from "./routes";
import { errorHandler } from "./errorHandler";

export const app = fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

// Zod validation
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(donationsRoutes);

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
