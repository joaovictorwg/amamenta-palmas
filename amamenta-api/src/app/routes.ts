import { FastifyInstance } from "fastify";
import { donatorRoutes } from "../modules/donator/routes/donator.routes";
import { authRoutes } from "@/modules/auth/routes/auth.routes";
import { inviteRoutes } from "@/modules/invites/routes/invite.route";
import { tenantRoutes } from "@/modules/tenants/routes/tenant.routes";
import { rawMilkRoutes } from "@/modules/donation/routes/rawMilk.routes";
import { pasteurizedMilkRoutes } from "@/modules/donation/routes/pasteurizedMilk.routes";
import { usersRoutes } from "@/modules/users/routes/users.routes";

export async function routes(app: FastifyInstance) {
  await app.register(donatorRoutes);
  await app.register(authRoutes);
  await app.register(inviteRoutes);
  await app.register(tenantRoutes);
  await app.register(usersRoutes, { prefix: "/users" });
  await app.register(pasteurizedMilkRoutes)
  await app.register(rawMilkRoutes)
}
