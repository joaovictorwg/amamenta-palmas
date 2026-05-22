import { FastifyInstance } from "fastify";
import { authenticateController } from "../controllers/authenticate.controller";
import { registerEmployeeByDomainController } from "../controllers/registerEmployeeByDomain.controller";
import { resendVerificationEmailController } from "../controllers/resendVerificationEmail.controller";
import { verifyEmailController } from "../controllers/verifyEmail.controller";
import { authenticateSchema } from "../schemas/authenticate.schema";
import { registerEmployeeByDomainSchema } from "../schemas/registerEmployeeByDomain.schema";
import { resendVerificationEmailSchema } from "../schemas/resendVerificationEmail.schema";
import { verifyEmailSchema } from "../schemas/verifyEmail.schema";
import { forgotPasswordSchema } from "../schemas/forgotPassword.schema";
import { forgotPasswordController } from "../controllers/forgotPassword.controller";
import { resetPasswordSchema } from "../schemas/resetPassword.schema";
import { resetPasswordController } from "../controllers/resetPassword.controller";

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

  app.post(
    "/auth/forgot-password",
    {
      schema: {
        body: forgotPasswordSchema,
      },
    },
    forgotPasswordController
  );

  app.post(
    "/auth/reset-password",
    {
      schema: {
        body: resetPasswordSchema,
      },
    },
    resetPasswordController
  );
}