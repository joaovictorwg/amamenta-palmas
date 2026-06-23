import { FastifyInstance } from "fastify";
import { authenticate } from "@/shared/middlewares/authenticate";
import { createDonatorController } from "../controllers/createDonator.controller";
import { DeleteDonatorController } from "../controllers/deleteDonator.controller";
import { exportDonatorController } from "../controllers/exportDonator.controller";
import {
  getDonatorByIdController,
  GetDonatorsController,
} from "../controllers/getDonator.controller";
import { getDonatorOverviewController } from "../controllers/getDonatorOverview.controller";
import { listDonatorExamsController } from "../controllers/listDonatorExams.controller";
import { registerDonatorExamsController } from "../controllers/registerDonatorExams.controller";
import { updateClinicalHistoryController } from "../controllers/updateClinicalHistory.controller";
import { UpdateDonatorController } from "../controllers/updateDonator.controller";
import { createDonatorSchema } from "../schemas/createDonator.schema";
import {
  getDonatorParamsSchema,
  getDonatorsQuerySchema,
} from "../schemas/getDonator.schema";
import { registerDonatorExamsSchema } from "../schemas/registerDonatorExams.schema";
import { updateClinicalHistorySchema } from "../schemas/updateClinicalHistory.schema";
import { updateDonatorSchema } from "../schemas/updateDonator.schema";

export async function donatorRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.post(
    "/donators",
    { schema: { body: createDonatorSchema } },
    createDonatorController,
  );

  app.get(
    "/donators",
    { schema: { querystring: getDonatorsQuerySchema } },
    GetDonatorsController,
  );

  app.get("/donators/overview", getDonatorOverviewController);

  app.get(
    "/donators/:id",
    { schema: { params: getDonatorParamsSchema } },
    getDonatorByIdController,
  );

  app.get(
    "/donators/:id/export",
    { schema: { params: getDonatorParamsSchema } },
    exportDonatorController,
  );

  app.patch(
    "/donators/:id/clinical-history",
    {
      schema: {
        params: getDonatorParamsSchema,
        body: updateClinicalHistorySchema,
      },
    },
    updateClinicalHistoryController,
  );

  app.get(
    "/donators/:id/exams",
    { schema: { params: getDonatorParamsSchema } },
    listDonatorExamsController,
  );

  app.post(
    "/donators/:id/exams",
    {
      schema: {
        params: getDonatorParamsSchema,
        body: registerDonatorExamsSchema,
      },
    },
    registerDonatorExamsController,
  );

  app.patch(
    "/donators/:id",
    { schema: { params: getDonatorParamsSchema, body: updateDonatorSchema } },
    UpdateDonatorController,
  );

  app.delete(
    "/donators/:id",
    { schema: { params: getDonatorParamsSchema } },
    DeleteDonatorController,
  );
}
