import { FastifyInstance } from "fastify";
import { donatorRoutes } from "../modules/donator/routes/donator.routes";

export async function routes(app: FastifyInstance) {
  await app.register(donatorRoutes);
}
