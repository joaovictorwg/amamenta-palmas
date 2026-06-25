import { UserRole } from "../entities/users.entity";
import { UserRepository } from "../repositories/user.repository";
import { ListUsersInput } from "../schemas/listUsers.schema";

interface Requester {
  id: string;
  role: UserRole;
  tenantId: string | null;
}

export class ListUsersUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute(filters: ListUsersInput, requester: Requester) {
    if (requester.role !== "super_admin") {
      filters.tenantId = requester.tenantId!;
    }


    const users = await this.userRepository.findMany(filters);

    return users.map((user) => {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    });
  }
}
