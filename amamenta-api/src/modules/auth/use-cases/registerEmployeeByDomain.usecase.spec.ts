import { AppError } from "@/shared/errors/AppError";
import { RegisterEmployeeByDomainUseCase } from "./registerEmployeeByDomain.usecase";
import { FakeMailProvider } from "../tests/fakes/fakeMailProvider";
import { FakeTenantRepository } from "../tests/fakes/fakeTenantRepository";
import { FakeUserRepository } from "../tests/fakes/fakeUserRepository";
import { sendVerificationEmail } from "../utils/sendVerificationEmail";

jest.mock("../utils/sendVerificationEmail", () => ({
    sendVerificationEmail: jest.fn(),
}));

describe("RegisterEmployeeByDomainUseCase", () => {
    let userRepository: FakeUserRepository;
    let tenantRepository: FakeTenantRepository;
    let mailProvider: FakeMailProvider;
    let useCase: RegisterEmployeeByDomainUseCase;

    beforeEach(() => {
        jest.clearAllMocks();

        userRepository = new FakeUserRepository();
        tenantRepository = new FakeTenantRepository();
        mailProvider = new FakeMailProvider();
        useCase = new RegisterEmployeeByDomainUseCase(
            userRepository,
            tenantRepository,
            mailProvider
        );
    });

    it("should register employee for matching tenant domain", async () => {
        tenantRepository.tenants.push({
            id: "tenant-1",
            name: "Tenant One",
            domain: "tenant.com",
            autoJoinByDomain: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: null,
        });

        const result = await useCase.execute({
            email: "new.user@tenant.com",
            password: "123456",
        });

        expect(result.user.email).toBe("new.user@tenant.com");
        expect(result.user.tenantId).toBe("tenant-1");
        expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
    });

    it("should resolve tenant by parent domain", async () => {
        tenantRepository.tenants.push({
            id: "tenant-1",
            name: "Tenant One",
            domain: "tenant.com",
            autoJoinByDomain: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: null,
        });

        const result = await useCase.execute({
            email: "new.user@sub.tenant.com",
            password: "123456",
        });

        expect(result.user.tenantId).toBe("tenant-1");
    });

    it("should rollback created user when email send fails", async () => {
        tenantRepository.tenants.push({
            id: "tenant-1",
            name: "Tenant One",
            domain: "tenant.com",
            autoJoinByDomain: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: null,
        });

        (sendVerificationEmail as jest.Mock).mockRejectedValueOnce(
            new Error("mail error")
        );

        await expect(
            useCase.execute({
                email: "new.user@tenant.com",
                password: "123456",
            })
        ).rejects.toBeInstanceOf(AppError);

        expect(userRepository.users).toHaveLength(0);
    });

    it("should reject when auto join is disabled", async () => {
        tenantRepository.tenants.push({
            id: "tenant-1",
            name: "Tenant One",
            domain: "tenant.com",
            autoJoinByDomain: false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: null,
        });

        await expect(
            useCase.execute({
                email: "new.user@tenant.com",
                password: "123456",
            })
        ).rejects.toBeInstanceOf(AppError);
    });
});
