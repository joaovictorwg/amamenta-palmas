import { FastifyInstance } from "fastify";
import { RawMilkTriageStatus } from "../enums/rawMilkTriageStatus.enum";
import { TriageRawMilkBatchUseCase } from "../use-cases/rawMilkCollection/triageRawMilkBatch.usecase";
import { DrizzleRawMilkCollectionRepository } from "../repositories/rawmilkCollection/drizzleRawMilkCollection.repository"

export async function rawMilkRoutes(app: FastifyInstance) {
    app.post("/raw-milk/triage", async (request, reply) => {
        const { rawMilkIds, status, rejectReason } = request.body as { rawMilkIds: string[], status: RawMilkTriageStatus, rejectReason?: string };
        const useCase = new TriageRawMilkBatchUseCase(new DrizzleRawMilkCollectionRepository());
        const result = await useCase.execute({ rawMilkIds, status, rejectReason });
        return reply.send({ updated: result.length });
    });
}
