import { FastifyInstance } from "fastify";
import { DistributePasteurizedMilkUseCase } from "../use-cases/PasteurizedMilkUnit/distributePasteurizedMilk.usecase";
import { DrizzlePasteurizedMilkUnitRepository } from "../repositories/pasteurizedMilkUnit/drizzlePasteurizedMilkUnit.repository";

export async function pasteurizedMilkRoutes(app: FastifyInstance) {
    app.patch("/pasteurized-milk/:id/distribute", async (request, reply) => {
        const { recipientIdentifier } = request.body as { recipientIdentifier?: string | null };
        const { id } = request.params as { id: string };
        const useCase = new DistributePasteurizedMilkUseCase(new DrizzlePasteurizedMilkUnitRepository);
        const result = await useCase.execute({ id, recipientIdentifier });
        return reply.send(result);
    });
}
