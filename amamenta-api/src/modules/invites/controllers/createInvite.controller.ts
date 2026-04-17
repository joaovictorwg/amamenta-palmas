import { FastifyRequest, FastifyReply } from "fastify";
import { DrizzleInviteRepository } from "../repositories/drizzleInvite.repository";
import { CreateInviteUseCase } from "../use-cases/createInvite.usecase";
import { CreateAdminInviteInput, CreateEmployeeInviteInput } from "../schemas/createInvite.schema";
import { DrizzleTenantRepository } from "@/modules/tenants/repositories/drizzleTenant.repository";
import { normalizeDomain } from "@/modules/tenants/utils/normalizeDomain";
import { AppError } from "@/shared/errors/AppError";
import { NotFoundError } from "@/shared/errors/NotFoundError";
import { NodemailerProvider } from "@/shared/mail/nodemailer.provider";
import { Tenant } from "@/modules/tenants/entities/tenant.entity";

async function resolveTenantId(
    tenantId: string | undefined,
    tenantIdentifier: string | undefined
): Promise<Tenant> {
    const tenantRepository = new DrizzleTenantRepository();

    if (tenantId) {
        const tenant = await tenantRepository.findById(tenantId);

        if (!tenant) {
            throw new NotFoundError("Tenant");
        }

        return tenant;
    }

    if (!tenantIdentifier) {
        throw new AppError("Informe tenantId ou tenantIdentifier");
    }

    const normalizedIdentifier = tenantIdentifier.trim();

    const tenant = normalizedIdentifier.includes(".") || normalizedIdentifier.includes("@")
        ? await tenantRepository.findByDomain(normalizeDomain(normalizedIdentifier))
        : await tenantRepository.findByName(normalizedIdentifier);

    if (!tenant) {
        throw new NotFoundError("Tenant");
    }

    return tenant;
}

export async function createAdminInviteController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { email, tenantId, tenantIdentifier } = request.body as CreateAdminInviteInput;

    const repo = new DrizzleInviteRepository();
    const mailProvider = new NodemailerProvider();
    const useCase = new CreateInviteUseCase(repo, mailProvider);
    const tenant = await resolveTenantId(tenantId, tenantIdentifier);

    const invite = await useCase.execute({
        email,
        role: "admin",
        tenantId: tenant.id,
        tenantName: tenant.name,
    });

    return reply.status(201).send(invite);
}

export async function createEmployeeInviteController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const { email } = request.body as CreateEmployeeInviteInput;

    const tenantId = request.user.tenantId;
    if (!tenantId) throw new AppError("Admin has no tenant associated");

    const repo = new DrizzleInviteRepository();
    const tenantRepository = new DrizzleTenantRepository();
    const mailProvider = new NodemailerProvider();
    const useCase = new CreateInviteUseCase(repo, mailProvider);
    const tenant = await tenantRepository.findById(tenantId);

    if (!tenant) {
        throw new NotFoundError("Tenant");
    }

    const invite = await useCase.execute({
        email,
        role: "employee",
        tenantId,
        tenantName: tenant.name,
    });

    return reply.status(201).send(invite);
}