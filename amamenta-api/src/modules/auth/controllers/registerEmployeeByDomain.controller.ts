import { DrizzleTenantRepository } from "@/modules/tenants/repositories/drizzleTenant.repository";
import { DrizzleUserRepository } from "@/modules/users/repositories/drizzleUser.repository";
import { EmailService } from "@/shared/mail/email.service";
import { FastifyReply, FastifyRequest } from "fastify";
import { RegisterEmployeeByDomainInput } from "../schemas/registerEmployeeByDomain.schema";
import { RegisterEmployeeByDomainUseCase } from "../use-cases/registerUseCase/registerEmployeeByDomain.usecase";

export async function registerEmployeeByDomainController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { email, password } = request.body as RegisterEmployeeByDomainInput;

    const userRepository = new DrizzleUserRepository();
    const tenantRepository = new DrizzleTenantRepository();
    const mailProvider = new EmailService();

    const useCase = new RegisterEmployeeByDomainUseCase(
        userRepository,
        tenantRepository,
        mailProvider
    );

    const result = await useCase.execute({ email, password });

    return reply.status(201).send(result);
}
