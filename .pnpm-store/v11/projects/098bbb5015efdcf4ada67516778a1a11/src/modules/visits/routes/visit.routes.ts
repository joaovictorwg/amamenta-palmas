import { FastifyInstance } from "fastify";

import { authenticate } from "@/shared/middlewares/authenticate";
import {
  createVisitController,
  listVisitsController,
  requestVisitController,
  updateVisitController,
  updateVisitStatusController,
} from "../controllers/visit.controller";
import {
  createVisitSchema,
  listVisitsQuerySchema,
  requestVisitSchema,
  updateVisitSchema,
  updateVisitStatusSchema,
  visitIdParamsSchema,
} from "../schemas/visit.schema";

export async function visitRoutes(app: FastifyInstance) {
  app.post(
    "/visits/request",
    { schema: { body: requestVisitSchema } },
    requestVisitController,
  );

  app.post(
    "/visits",
    { preHandler: [authenticate], schema: { body: createVisitSchema } },
    createVisitController,
  );

  app.get(
    "/visits",
    { preHandler: [authenticate], schema: { querystring: listVisitsQuerySchema } },
    listVisitsController,
  );

  app.patch(
    "/visits/:id",
    {
      preHandler: [authenticate],
      schema: { params: visitIdParamsSchema, body: updateVisitSchema },
    },
    updateVisitController,
  );

  app.patch(
    "/visits/:id/status",
    {
      preHandler: [authenticate],
      schema: { params: visitIdParamsSchema, body: updateVisitStatusSchema },
    },
    updateVisitStatusController,
  );
}
