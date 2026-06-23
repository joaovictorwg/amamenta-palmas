import { AppError } from "@/shared/errors/AppError";
import { ForbiddenError } from "@/shared/errors/ForbiddenError";
import { UserRepository } from "../repositories/user.repository";
import { UpdateUserInput } from "../schemas/updateUser.schema";

interface Requester {
  id: string;
  role: string;
  tenantId: string | null;
}

export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string, data: UpdateUserInput, requester: Requester) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Auth logic
    if (requester.role !== "super_admin") {
      if (requester.role === "admin") {
        if (user.tenantId !== requester.tenantId) {
          throw new ForbiddenError("You don't have permission to update this user");
        }
      } else if (requester.id !== id) {
        throw new ForbiddenError("You don't have permission to update this user");
      }
    }

    // Prevent non-super_admin from changing role or tenantId
    if (requester.role !== "super_admin") {
      delete data.role;
      delete data.tenantId;
    }

    if (data.email && data.email !== user.email) {
      const emailExists = await this.userRepository.findByEmail(data.email);
      if (emailExists) {
        throw new AppError("Email already in use", 409);
      }
    }

    const updatedUser = await this.userRepository.update(id, data);

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
