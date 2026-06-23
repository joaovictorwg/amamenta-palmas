import { AppError } from "@/shared/errors/AppError";
import { FakeResetPwdMailRepository } from "../../tests/fakes/fakeResetPwdMailRepository";
import { FakeUserRepository } from "../../tests/fakes/fakeUserRepository";
import { ResetPasswordUseCase } from "./resetPassword.usecase";

describe("ResetPasswordUseCase", () => {
  it("resets the password and marks the token as used", async () => {
    const userRepository = new FakeUserRepository();
    const resetPwdMailRepository = new FakeResetPwdMailRepository();
    const useCase = new ResetPasswordUseCase(
      userRepository,
      resetPwdMailRepository,
    );

    const user = await userRepository.create({
      email: "user@test.com",
      passwordHash: "old-hash",
      role: "employee",
      tenantId: crypto.randomUUID(),
      isVerified: true,
      name: null,
    });

    const resetPwdMail = await resetPwdMailRepository.create({
      userId: user.id,
      email: user.email,
      token: "reset-token",
      used: false,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    await useCase.execute({
      token: "reset-token",
      newPassword: "new-password",
    });

    const updatedUser = await userRepository.findById(user.id);

    expect(updatedUser?.passwordHash).not.toBe("old-hash");
    expect(resetPwdMail.used).toBe(true);
  });

  it("rejects used tokens", async () => {
    const userRepository = new FakeUserRepository();
    const resetPwdMailRepository = new FakeResetPwdMailRepository();
    const useCase = new ResetPasswordUseCase(
      userRepository,
      resetPwdMailRepository,
    );

    await resetPwdMailRepository.create({
      userId: crypto.randomUUID(),
      email: "user@test.com",
      token: "used-token",
      used: true,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    await expect(
      useCase.execute({
        token: "used-token",
        newPassword: "new-password",
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
