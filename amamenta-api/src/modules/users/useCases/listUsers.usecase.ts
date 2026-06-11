import { UserRepository } from "../repositories/user.repository";
import { ListUsersInput } from "../schemas/listUsers.schema";

interface Requester {
  id: string;
  role: string;
  tenantId: string | null;
}

export class ListUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(filters: ListUsersInput, requester: Requester) {
    if (requester.role === "admin") {
      filters.tenantId = requester.tenantId!;
    }

    const users = await this.userRepository.findMany(filters);

    return users.map((user) => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}
