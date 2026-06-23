import { FastifyInstance } from "fastify";
import { authenticate } from "@/shared/middlewares/authenticate";
import { requireRole } from "@/shared/middlewares/requireRole";
import { createTenantController } from "../controllers/createTenant.controller";
import { createTenantSchema } from "../schemas/tenant.schema";

export async function tenantRoutes(app: FastifyInstance) {
    app.post(
        "/tenants",
        {
            preHandler: [authenticate, requireRole("super_admin")],
            schema: { body: createTenantSchema },
        },
        createTenantController
    );
}
