import { FastifyInstance } from "fastify";
import { authenticate } from "@/shared/middlewares/authenticate";
import { requireRole } from "@/shared/middlewares/requireRole";
import { listUsersController } from "../controllers/listUsers.controller";
import { getUserByIdController } from "../controllers/getUserById.controller";
import { updateUserController } from "../controllers/updateUser.controller";
import { listUsersSchema } from "../schemas/listUsers.schema";
import { updateUserSchema } from "../schemas/updateUser.schema";
import { getUserByIdSchema } from "../schemas/getUserById.schema";

export async function usersRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get(
    "/",
    {
      schema: {
        querystring: listUsersSchema,
      },
      preHandler: [requireRole(["super_admin", "admin"])],
    },
    listUsersController
  );

  app.get(
    "/:id",
    {
      schema: {
        params: getUserByIdSchema,
      },
      preHandler: [requireRole(["super_admin", "admin", "employee"]), authenticate],
    },
    getUserByIdController
  );

  app.patch(
    "/:id",
    {
      schema: {
        params: getUserByIdSchema,
        body: updateUserSchema,
      },
    },
    updateUserController
  );
}
