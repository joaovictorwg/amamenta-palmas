import { FastifyInstance } from "fastify";

import { authenticate } from "@/shared/middlewares/authenticate";
import { getOverviewController } from "../controllers/overview.controller";

export async function overviewRoutes(app: FastifyInstance) {
  app.get("/overview", { preHandler: [authenticate] }, getOverviewController);
}
