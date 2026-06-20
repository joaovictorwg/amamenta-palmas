import { FastifyInstance } from "fastify";
import { authenticate } from "@/shared/middlewares/authenticate";
import {
    approveRawMilkController,
    createRawMilkController,
    getRawMilkByIdController,
    getRawMilkController,
    rejectRawMilkController,
    triageRawMilkBatchController,
    updateRawMilkController,
} from "../controllers/rawMilk.controller";
import {
    createRawMilkSchema,
    rawMilkIdParamsSchema,
    rawMilkQuerySchema,
    rejectRawMilkSchema,
    triageRawMilkBatchSchema,
    updateRawMilkSchema,
} from "../schemas/rawMilk.schema";

export async function rawMilkRoutes(app: FastifyInstance) {
    app.addHook("preHandler", authenticate);

    app.post(
        "/raw-milk",
        { schema: { body: createRawMilkSchema } },
        createRawMilkController,
    );
    app.get(
        "/raw-milk",
        { schema: { querystring: rawMilkQuerySchema } },
        getRawMilkController,
    );
    app.get(
        "/raw-milk/:id",
        { schema: { params: rawMilkIdParamsSchema } },
        getRawMilkByIdController,
    );
    app.patch(
        "/raw-milk/:id",
        { schema: { params: rawMilkIdParamsSchema, body: updateRawMilkSchema } },
        updateRawMilkController,
    );
    app.post(
        "/raw-milk/triage",
        { schema: { body: triageRawMilkBatchSchema } },
        triageRawMilkBatchController,
    );
    app.patch(
        "/raw-milk/:id/approve",
        { schema: { params: rawMilkIdParamsSchema } },
        approveRawMilkController,
    );
    app.patch(
        "/raw-milk/:id/reject",
        { schema: { params: rawMilkIdParamsSchema, body: rejectRawMilkSchema } },
        rejectRawMilkController,
    );
}
