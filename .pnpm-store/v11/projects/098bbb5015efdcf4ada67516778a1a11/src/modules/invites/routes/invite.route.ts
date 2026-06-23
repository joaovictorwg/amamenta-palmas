import { FastifyInstance } from "fastify";
import { authenticate } from "@/shared/middlewares/authenticate";
import { requireRole } from "@/shared/middlewares/requireRole";
import { createAdminInviteController, createEmployeeInviteController } from "../controllers/createInvite.controller";
import { acceptInviteController } from "../controllers/acceptInvite.controller";
import { createAdminInviteSchema, createEmployeeInviteSchema } from "../schemas/createInvite.schema";
import { acceptInviteSchema } from "../schemas/acceptInvite.schema";

export async function inviteRoutes(app: FastifyInstance) {
    app.post(
        "/invites/admin",
        {
            preHandler: [authenticate, requireRole("super_admin")],
            schema: { body: createAdminInviteSchema },
        },
        createAdminInviteController
    );

    app.post(
        "/invites/employee",
        {
            preHandler: [authenticate, requireRole("admin")],
            schema: { body: createEmployeeInviteSchema },
        },
        createEmployeeInviteController
    );

    app.post(
        "/invites/accept",
        { schema: { body: acceptInviteSchema } },
        acceptInviteController
    );
}