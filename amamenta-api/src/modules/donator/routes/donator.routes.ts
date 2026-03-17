import { FastifyInstance } from "fastify";
import { createDonatorSchema } from "../schemas/createDonator.schema";
import { createDonatorController } from "../controllers/createDonator.controller";
import {
  getDonatorByIdController,
  GetDonatorsController,
} from "../controllers/getDonator.controller";
import { updateDonatorSchema } from "../schemas/updateDonator.schema";
import { UpdateDonatorController } from "../controllers/updateDonator.controller";
import { DeleteDonatorController } from "../controllers/deleteDonator.controller";

export async function donatorRoutes(app: FastifyInstance) {
  app.post(
    "/donators",
    { schema: { body: createDonatorSchema } },
    createDonatorController,
  );

  app.get("/donators", GetDonatorsController);

  app.get("/donators/:id", getDonatorByIdController);

  app.patch(
    "/donators/:id",
    { schema: { body: updateDonatorSchema } },
    UpdateDonatorController,
  );

  app.delete("/donators/:id", DeleteDonatorController);
}
