import { DrizzleTenantRepository } from "@/modules/tenants/repositories/drizzleTenant.repository";
import { DrizzleUserRepository } from "@/modules/users/repositories/drizzleUser.repository";
import { NodemailerProvider } from "@/shared/mail/nodemailer.provider";
import { FastifyReply, FastifyRequest } from "fastify";
import { RegisterEmployeeByDomainInput } from "../schemas/registerEmployeeByDomain.schema";
import { RegisterEmployeeByDomainUseCase } from "../use-cases/registerEmployeeByDomain.usecase";

export async function registerEmployeeByDomainController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { email, password } = request.body as RegisterEmployeeByDomainInput;

    const userRepository = new DrizzleUserRepository();
    const tenantRepository = new DrizzleTenantRepository();
    const mailProvider = new NodemailerProvider();

    const useCase = new RegisterEmployeeByDomainUseCase(
        userRepository,
        tenantRepository,
        mailProvider
    );

    const result = await useCase.execute({ email, password });

    return reply.status(201).send(result);
}
