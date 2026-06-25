import { FastifyInstance } from "fastify";
import { authenticate } from "@/shared/middlewares/authenticate";
import { requireRole } from "@/shared/middlewares/requireRole";
import { createAdminInviteController, createEmployeeInviteController } from "../controllers/createInvite.controller";
import { acceptInviteController } from "../controllers/acceptInvite.controller";
import { deleteInviteController, listInvitesController } from "../controllers/manageInvite.controller";
import { createAdminInviteSchema, createEmployeeInviteSchema } from "../schemas/createInvite.schema";
import { acceptInviteSchema } from "../schemas/acceptInvite.schema";
import { inviteIdParamsSchema, listInvitesSchema } from "../schemas/listInvites.schema";

export async function inviteRoutes(app: FastifyInstance) {
    app.get(
        "/invites",
        {
            preHandler: [authenticate, requireRole(["super_admin", "admin"])],
            schema: { querystring: listInvitesSchema },
        },
        listInvitesController
    );

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

    app.delete(
        "/invites/:id",
        {
            preHandler: [authenticate, requireRole(["super_admin", "admin"])],
            schema: { params: inviteIdParamsSchema },
        },
        deleteInviteController
    );
}
