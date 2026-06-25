import { FastifyInstance } from "fastify";
import { authenticate } from "@/shared/middlewares/authenticate";
import { requireRole } from "@/shared/middlewares/requireRole";
import { createTenantController } from "../controllers/createTenant.controller";
import {
    deleteTenantController,
    listTenantsController,
    updateTenantController,
} from "../controllers/manageTenant.controller";
import {
    createTenantSchema,
    tenantIdParamsSchema,
    updateTenantSchema,
} from "../schemas/tenant.schema";

export async function tenantRoutes(app: FastifyInstance) {
    app.get(
        "/tenants",
        {
            preHandler: [authenticate, requireRole("super_admin")],
        },
        listTenantsController
    );

    app.post(
        "/tenants",
        {
            preHandler: [authenticate, requireRole("super_admin")],
            schema: { body: createTenantSchema },
        },
        createTenantController
    );

    app.patch(
        "/tenants/:id",
        {
            preHandler: [authenticate, requireRole("super_admin")],
            schema: { params: tenantIdParamsSchema, body: updateTenantSchema },
        },
        updateTenantController
    );

    app.delete(
        "/tenants/:id",
        {
            preHandler: [authenticate, requireRole("super_admin")],
            schema: { params: tenantIdParamsSchema },
        },
        deleteTenantController
    );
}
