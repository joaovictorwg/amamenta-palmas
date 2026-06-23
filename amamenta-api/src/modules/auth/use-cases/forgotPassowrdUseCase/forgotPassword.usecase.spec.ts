import { ForgotPasswordUseCase } from "./forgotPassword.usecase";
import { FakeMailProvider } from "../../tests/fakes/fakeMailProvider";
import { FakeResetPwdMailRepository } from "../../tests/fakes/fakeResetPwdMailRepository";
import { FakeUserRepository } from "../../tests/fakes/fakeUserRepository";

describe("ForgotPasswordUseCase", () => {
  it("creates a reset token and sends the reset link", async () => {
    const userRepository = new FakeUserRepository();
    const resetPwdMailRepository = new FakeResetPwdMailRepository();
    const mailProvider = new FakeMailProvider();
    const useCase = new ForgotPasswordUseCase(
      userRepository,
      resetPwdMailRepository,
      mailProvider,
    );

    await userRepository.create({
      email: "user@test.com",
      passwordHash: "old-hash",
      role: "employee",
      tenantId: crypto.randomUUID(),
      isVerified: true,
      name: null,
    });

    await useCase.execute({ email: "USER@test.com" });

    const resetPwdMail = resetPwdMailRepository.resetPwdMails[0];

    expect(resetPwdMail).toMatchObject({
      email: "user@test.com",
      used: false,
    });
    expect(mailProvider.sent[0].text).toContain(
      `/reset-password?token=${resetPwdMail.token}`,
    );
  });

  it("does not send email when the user does not exist", async () => {
    const userRepository = new FakeUserRepository();
    const resetPwdMailRepository = new FakeResetPwdMailRepository();
    const mailProvider = new FakeMailProvider();
    const useCase = new ForgotPasswordUseCase(
      userRepository,
      resetPwdMailRepository,
      mailProvider,
    );

    await useCase.execute({ email: "missing@test.com" });

    expect(resetPwdMailRepository.resetPwdMails).toHaveLength(0);
    expect(mailProvider.sent).toHaveLength(0);
  });
});
