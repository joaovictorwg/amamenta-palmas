import { FakeUserRepository } from "@/modules/auth/tests/fakes/fakeUserRepository";
import { UpdateUserUseCase } from "./updateUser.usecase";
import { ForbiddenError } from "@/shared/errors/ForbiddenError";

describe("UpdateUserUseCase", () => {
  let userRepository: FakeUserRepository;
  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    userRepository = new FakeUserRepository();
    useCase = new UpdateUserUseCase(userRepository);
  });

  it("should update user", async () => {
    const user = await userRepository.create({
      name: "Old Name",
      email: "user@test.com",
      passwordHash: "hash",
      role: "employee",
      tenantId: "tenant-1",
      isVerified: true,
    });

    const result = await useCase.execute(user.id, { name: "New Name" }, { id: user.id, role: "employee", tenantId: "tenant-1" });

    expect(result.name).toBe("New Name");
  });

  it("should not allow non-super_admin to update role", async () => {
    const user = await userRepository.create({
      name: "User",
      email: "user@test.com",
      passwordHash: "hash",
      role: "employee",
      tenantId: "tenant-1",
      isVerified: true,
    });

    const result = await useCase.execute(
      user.id, 
      { role: "admin" as any }, 
      { id: user.id, role: "employee", tenantId: "tenant-1" }
    );

    expect(result.role).toBe("employee");
  });
});
