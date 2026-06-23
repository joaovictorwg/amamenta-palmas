import { FakeUserRepository } from "@/modules/auth/tests/fakes/fakeUserRepository";
import { ListUsersUseCase } from "./listUsers.usecase";

describe("ListUsersUseCase", () => {
  let userRepository: FakeUserRepository;
  let useCase: ListUsersUseCase;

  beforeEach(() => {
    userRepository = new FakeUserRepository();
    useCase = new ListUsersUseCase(userRepository);
  });

  it("should list all users for super_admin", async () => {
    await userRepository.create({
      name: "Admin 1",
      email: "admin1@tenant.com",
      passwordHash: "hash",
      role: "admin",
      tenantId: "tenant-1",
      isVerified: true,
    });

    await userRepository.create({
      name: "Admin 2",
      email: "admin2@tenant2.com",
      passwordHash: "hash",
      role: "admin",
      tenantId: "tenant-2",
      isVerified: true,
    });

    const result = await useCase.execute({}, { id: "super-id", role: "super_admin", tenantId: null });

    expect(result).toHaveLength(2);
  });

  it("should list only tenant users for admin", async () => {
    await userRepository.create({
      name: "Admin 1",
      email: "admin1@tenant.com",
      passwordHash: "hash",
      role: "admin",
      tenantId: "tenant-1",
      isVerified: true,
    });

    await userRepository.create({
      name: "Admin 2",
      email: "admin2@tenant2.com",
      passwordHash: "hash",
      role: "admin",
      tenantId: "tenant-2",
      isVerified: true,
    });

    const result = await useCase.execute({}, { id: "admin-id", role: "admin", tenantId: "tenant-1" });

    expect(result).toHaveLength(1);
    expect(result[0].email).toBe("admin1@tenant.com");
  });
});
