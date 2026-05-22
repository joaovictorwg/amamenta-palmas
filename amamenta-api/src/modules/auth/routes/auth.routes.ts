import { FastifyInstance } from "fastify";
import { authenticateController } from "../controllers/authenticate.controller";
import { registerEmployeeByDomainController } from "../controllers/registerEmployeeByDomain.controller";
import { resendVerificationEmailController } from "../controllers/resendVerificationEmail.controller";
import { verifyEmailController } from "../controllers/verifyEmail.controller";
import { authenticateSchema } from "../schemas/authenticate.schema";
import { registerEmployeeByDomainSchema } from "../schemas/registerEmployeeByDomain.schema";
import { resendVerificationEmailSchema } from "../schemas/resendVerificationEmail.schema";
import { verifyEmailSchema } from "../schemas/verifyEmail.schema";
import { authenticate } from "@/shared/middlewares/authenticate";
import { GetAuthUserUseCase } from "@/modules/users/use-cases/getAuthUser.usecase";
import { DrizzleUserRepository } from "@/modules/users/repositories/drizzleUser.repository";

export async function authRoutes(app: FastifyInstance) {
  app.post(
    "/auth/register-employee",
    {
      schema: {
        body: registerEmployeeByDomainSchema,
      },
    },
    registerEmployeeByDomainController
  );

  app.post(
    "/auth/verify-email",
    {
      schema: {
        body: verifyEmailSchema,
      },
    },
    verifyEmailController
  );

  app.post(
    "/auth/resend-verification-email",
    {
      schema: {
        body: resendVerificationEmailSchema,
      },
    },
    resendVerificationEmailController
  );

  app.post(
    "/auth/login",
    {
      schema: {
        body: authenticateSchema,
      },
    },
    authenticateController
  );

  app.get(
    "/auth/user",
    {
      preHandler: [authenticate],
    },
    async (request) => {
      const userRepository = new DrizzleUserRepository();

      const useCase = new GetAuthUserUseCase(userRepository);

      const user = await useCase.execute(request.user.id);

      return { user };
    }
  );
}