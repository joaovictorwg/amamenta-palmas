import { FastifyInstance } from "fastify";
import { authenticate } from "@/shared/middlewares/authenticate";
import {
    approvePasteurizationBatchController,
    createPasteurizationBatchController,
    getPasteurizationBatchByIdController,
    getPasteurizationBatchesController,
    rejectPasteurizationBatchController,
} from "../controllers/pasteurizationBatch.controller";
import {
    approvePasteurizationBatchSchema,
    createPasteurizationBatchSchema,
    pasteurizationBatchIdParamsSchema,
    pasteurizationBatchQuerySchema,
    rejectPasteurizationBatchSchema,
} from "../schemas/pasteurizationBatch.schema";

export async function pasteurizationBatchRoutes(app: FastifyInstance) {
    app.addHook("preHandler", authenticate);

    app.post(
        "/pasteurization-batches",
        { schema: { body: createPasteurizationBatchSchema } },
        createPasteurizationBatchController,
    );
    app.get(
        "/pasteurization-batches",
        { schema: { querystring: pasteurizationBatchQuerySchema } },
        getPasteurizationBatchesController,
    );
    app.get(
        "/pasteurization-batches/:id",
        { schema: { params: pasteurizationBatchIdParamsSchema } },
        getPasteurizationBatchByIdController,
    );
    app.patch(
        "/pasteurization-batches/:id/approve",
        { schema: { params: pasteurizationBatchIdParamsSchema, body: approvePasteurizationBatchSchema } },
        approvePasteurizationBatchController,
    );
    app.patch(
        "/pasteurization-batches/:id/reject",
        { schema: { params: pasteurizationBatchIdParamsSchema, body: rejectPasteurizationBatchSchema } },
        rejectPasteurizationBatchController,
    );
}
