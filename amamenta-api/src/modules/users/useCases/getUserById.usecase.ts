import { AppError } from "@/shared/errors/AppError";
import { ForbiddenError } from "@/shared/errors/ForbiddenError";
import { UserRepository } from "../repositories/user.repository";

interface Requester {
  id: string;
  role: string;
  tenantId: string | null;
}

export class GetUserByIdUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string, requester: Requester) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Auth logic
    if (requester.role !== "super_admin") {
      if (requester.role === "admin") {
        if (user.tenantId !== requester.tenantId) {
          throw new ForbiddenError("You don't have permission to see this user");
        }
      } else if (requester.id !== id) {
        throw new ForbiddenError("You don't have permission to see this user");
      }
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
