import { AppError } from "@/shared/errors/AppError";
import { VerifyEmailUseCase } from "./verifyEmail.usecase";
import { FakeUserRepository } from "../tests/fakes/fakeUserRepository";
import { verifyEmailVerificationToken } from "@/shared/utils/jwt";

jest.mock("@/shared/utils/jwt", () => ({
    verifyEmailVerificationToken: jest.fn(),
}));

describe("VerifyEmailUseCase", () => {
    let userRepository: FakeUserRepository;
    let useCase: VerifyEmailUseCase;

    beforeEach(() => {
        jest.clearAllMocks();

        userRepository = new FakeUserRepository();
        useCase = new VerifyEmailUseCase(userRepository);
    });

    it("should verify user email when token is valid", async () => {
        const user = await userRepository.create({
            email: "user@tenant.com",
            passwordHash: "hash",
            role: "employee",
            tenantId: "tenant-1",
            isVerified: false,
            twoFactorEnabled: false,
            twoFactorSecret: null,
        });

        (verifyEmailVerificationToken as jest.Mock).mockReturnValueOnce({
            sub: user.id,
            email: user.email,
            purpose: "email_verification",
        });

        const result = await useCase.execute({ token: "token" });

        expect(result.isVerified).toBe(true);
        expect(result.email).toBe("user@tenant.com");
    });

    it("should be idempotent when user is already verified", async () => {
        const user = await userRepository.create({
            email: "user@tenant.com",
            passwordHash: "hash",
            role: "employee",
            tenantId: "tenant-1",
            isVerified: true,
            twoFactorEnabled: false,
            twoFactorSecret: null,
        });

        (verifyEmailVerificationToken as jest.Mock).mockReturnValueOnce({
            sub: user.id,
            email: user.email,
            purpose: "email_verification",
        });

        const result = await useCase.execute({ token: "token" });

        expect(result.isVerified).toBe(true);
        expect(userRepository.users).toHaveLength(1);
    });

    it("should reject invalid token payload", async () => {
        (verifyEmailVerificationToken as jest.Mock).mockReturnValueOnce({
            sub: "id",
            email: "user@tenant.com",
            purpose: "other",
        });

        await expect(useCase.execute({ token: "token" })).rejects.toBeInstanceOf(
            AppError
        );
    });

    it("should reject when jwt parsing fails", async () => {
        (verifyEmailVerificationToken as jest.Mock).mockImplementationOnce(() => {
            throw new Error("invalid");
        });

        await expect(useCase.execute({ token: "token" })).rejects.toBeInstanceOf(
            AppError
        );
    });
});
