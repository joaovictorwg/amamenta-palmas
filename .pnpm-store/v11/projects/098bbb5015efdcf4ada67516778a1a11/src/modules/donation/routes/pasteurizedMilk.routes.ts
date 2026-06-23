import { FastifyInstance } from "fastify";
import { authenticate } from "@/shared/middlewares/authenticate";
import {
    createPasteurizedMilkController,
    discardPasteurizedMilkController,
    distributePasteurizedMilkController,
    getPasteurizedMilkByIdController,
    getPasteurizedMilkController,
} from "../controllers/pasteurizedMilk.controller";
import {
    createPasteurizedMilkSchema,
    discardPasteurizedMilkSchema,
    distributePasteurizedMilkSchema,
    pasteurizedMilkIdParamsSchema,
    pasteurizedMilkQuerySchema,
} from "../schemas/pasteurizedMilk.schema";

export async function pasteurizedMilkRoutes(app: FastifyInstance) {
    app.addHook("preHandler", authenticate);

    app.post(
        "/pasteurized-milk",
        { schema: { body: createPasteurizedMilkSchema } },
        createPasteurizedMilkController,
    );
    app.get(
        "/pasteurized-milk",
        { schema: { querystring: pasteurizedMilkQuerySchema } },
        getPasteurizedMilkController,
    );
    app.get(
        "/pasteurized-milk/:id",
        { schema: { params: pasteurizedMilkIdParamsSchema } },
        getPasteurizedMilkByIdController,
    );
    app.patch(
        "/pasteurized-milk/:id/distribute",
        { schema: { params: pasteurizedMilkIdParamsSchema, body: distributePasteurizedMilkSchema } },
        distributePasteurizedMilkController,
    );
    app.patch(
        "/pasteurized-milk/:id/discard",
        { schema: { params: pasteurizedMilkIdParamsSchema, body: discardPasteurizedMilkSchema } },
        discardPasteurizedMilkController,
    );
}
