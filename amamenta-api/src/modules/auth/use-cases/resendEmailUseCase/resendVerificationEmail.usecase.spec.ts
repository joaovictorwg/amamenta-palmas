import { ResendVerificationEmailUseCase } from "./resendVerificationEmail.usecase";
import { FakeMailProvider } from "../../tests/fakes/fakeMailProvider";
import { FakeUserRepository } from "../../tests/fakes/fakeUserRepository";
import { assertCanResendVerification } from "../../utils/resendVerificationRateLimiter";
import { sendVerificationEmail } from "../../utils/sendVerificationEmail";

jest.mock("../utils/resendVerificationRateLimiter", () => ({
    assertCanResendVerification: jest.fn(),
}));

jest.mock("../utils/sendVerificationEmail", () => ({
    sendVerificationEmail: jest.fn(),
}));

describe("ResendVerificationEmailUseCase", () => {
    let userRepository: FakeUserRepository;
    let mailProvider: FakeMailProvider;
    let useCase: ResendVerificationEmailUseCase;

    beforeEach(() => {
        jest.clearAllMocks();

        userRepository = new FakeUserRepository();
        mailProvider = new FakeMailProvider();
        useCase = new ResendVerificationEmailUseCase(userRepository, mailProvider);
    });

    it("should return neutral message when user does not exist", async () => {
        const result = await useCase.execute({ email: "missing@tenant.com" });

        expect(result.message).toContain("If the email is eligible");
        expect(sendVerificationEmail).not.toHaveBeenCalled();
    });

    it("should return neutral message when user is already verified", async () => {
        await userRepository.create({
            email: "user@tenant.com",
            passwordHash: "hash",
            role: "employee",
            tenantId: "tenant-1",
            isVerified: true,
            twoFactorEnabled: false,
            twoFactorSecret: null,
        });

        const result = await useCase.execute({ email: "user@tenant.com" });

        expect(result.message).toContain("If the email is eligible");
        expect(sendVerificationEmail).not.toHaveBeenCalled();
    });

    it("should send verification email for unverified users", async () => {
        const user = await userRepository.create({
            email: "user@tenant.com",
            passwordHash: "hash",
            role: "employee",
            tenantId: "tenant-1",
            isVerified: false,
        });

        const result = await useCase.execute({ email: "user@tenant.com" });

        expect(result.message).toContain("If the email is eligible");
        expect(sendVerificationEmail).toHaveBeenCalledWith({
            mailProvider,
            userId: user.id,
            email: user.email,
        });
    });

    it("should still return neutral message when mail send fails", async () => {
        await userRepository.create({
            email: "user@tenant.com",
            passwordHash: "hash",
            role: "employee",
            tenantId: "tenant-1",
            isVerified: false,
        });

        (sendVerificationEmail as jest.Mock).mockRejectedValueOnce(
            new Error("mail error")
        );

        const result = await useCase.execute({ email: "user@tenant.com" });

        expect(result.message).toContain("If the email is eligible");
    });

    it("should call rate limiter with normalized email", async () => {
        await useCase.execute({ email: "  USER@TENANT.COM  " });

        expect(assertCanResendVerification).toHaveBeenCalledWith("user@tenant.com");
    });
});
esendVerification).toHaveBeenCalledWith("user@tenant.com");
    });
});
