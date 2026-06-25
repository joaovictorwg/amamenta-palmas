import { hashPassword } from "@/shared/utils/hash";
import { UnauthorizedError } from "@/shared/errors/UnauthorizedError";
import { AuthenticateUserUseCase } from "./login.usecase";
import { FakeUserRepository } from "../../tests/fakes/fakeUserRepository";

describe("AuthenticateUserUseCase", () => {
    let userRepository: FakeUserRepository;
    let useCase: AuthenticateUserUseCase;

    beforeEach(() => {
        userRepository = new FakeUserRepository();
        useCase = new AuthenticateUserUseCase(userRepository);
    });

    it("should authenticate a verified user", async () => {
        const passwordHash = await hashPassword("123456");

        await userRepository.create({
            email: "admin@tenant.com",
            passwordHash,
            role: "admin",
            tenantId: "tenant-1",
            isVerified: true,
        });

        const result = await useCase.execute({
            email: " admin@tenant.com ",
            password: "123456",
        });

        expect(result.token).toBeDefined();
        expect(result.user.email).toBe("admin@tenant.com");
        expect(result.user.role).toBe("admin");
    });

    it("should reject invalid password", async () => {
        const passwordHash = await hashPassword("123456");

        await userRepository.create({
            email: "admin@tenant.com",
            passwordHash,
            role: "admin",
            tenantId: "tenant-1",
            isVerified: true,
        });

        await expect(
            useCase.execute({
                email: "admin@tenant.com",
                password: "wrong-password",
            })
        ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("should reject unverified user", async () => {
        const passwordHash = await hashPassword("123456");

        await userRepository.create({
            email: "employee@tenant.com",
            passwordHash,
            role: "employee",
            tenantId: "tenant-1",
            isVerified: false,
        });

        await expect(
            useCase.execute({
                email: "employee@tenant.com",
                password: "123456",
            })
        ).rejects.toBeInstanceOf(UnauthorizedError);
    });
});
