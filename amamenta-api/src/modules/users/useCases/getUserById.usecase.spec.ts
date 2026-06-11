import { FakeUserRepository } from "@/modules/auth/tests/fakes/fakeUserRepository";
import { GetUserByIdUseCase } from "./getUserById.usecase";
import { ForbiddenError } from "@/shared/errors/ForbiddenError";

describe("GetUserByIdUseCase", () => {
  let userRepository: FakeUserRepository;
  let useCase: GetUserByIdUseCase;

  beforeEach(() => {
    userRepository = new FakeUserRepository();
    useCase = new GetUserByIdUseCase(userRepository);
  });

  it("should get user by id", async () => {
    const user = await userRepository.create({
      name: "User Test",
      email: "user@test.com",
      passwordHash: "hash",
      role: "employee",
      tenantId: "tenant-1",
      isVerified: true,
    });

    const result = await useCase.execute(user.id, { id: user.id, role: "employee", tenantId: "tenant-1" });

    expect(result.id).toBe(user.id);
    expect(result.email).toBe("user@test.com");
  });

  it("should not allow employee to see another user", async () => {
    const user1 = await userRepository.create({
      name: "User 1",
      email: "user1@test.com",
      passwordHash: "hash",
      role: "employee",
      tenantId: "tenant-1",
      isVerified: true,
    });

    const user2 = await userRepository.create({
      name: "User 2",
      email: "user2@test.com",
      passwordHash: "hash",
      role: "employee",
      tenantId: "tenant-1",
      isVerified: true,
    });

    await expect(
      useCase.execute(user2.id, { id: user1.id, role: "employee", tenantId: "tenant-1" })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
