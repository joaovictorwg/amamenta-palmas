import { FastifyRequest, FastifyReply } from "fastify";
import { DrizzleTenantRepository } from "../repositories/drizzleTenant.repository";
import { CreateTenantUseCase } from "../use-cases/createTenant.usecase";
import { CreateTenantInput } from "../schemas/tenant.schema";

export async function createTenantController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { name, domain, autoJoinByDomain } = request.body as CreateTenantInput;

    const repo = new DrizzleTenantRepository();
    const useCase = new CreateTenantUseCase(repo);

    const tenant = await useCase.execute({
        name,
        domain,
        autoJoinByDomain,
    });

    return reply.status(201).send(tenant);
}