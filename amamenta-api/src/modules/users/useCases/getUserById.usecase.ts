import { AppError } from "@/shared/errors/AppError";
import { ForbiddenError } from "@/shared/errors/ForbiddenError";
import { UserRepository } from "../repositories/user.repository";
import { UserRole } from "../entities/users.entity";

interface Requester {
  id: string;
  role: UserRole;
  tenantId: string | null;
}

export class GetUserByIdUseCase {
  constructor(
    private userRepository: UserRepository
  ) { }

  async execute(
    id: string,
    requester: Requester
  ) {
    let user = null;

    if (requester.role === "super_admin") {
      user =
        await this.userRepository.findById(id);
    }

    else if (requester.role === "admin") {
      user =
        await this.userRepository.findById(
          id,
          requester.tenantId!
        );
    }

    else {
      if (requester.id !== id) {
        throw new ForbiddenError(
          "You don't have permission to see this user"
        );
      }

      user =
        await this.userRepository.findById(
          id,
          requester.tenantId!
        );
    }

    if (!user) {
      throw new AppError(
        "User not found",
        404
      );
    }

    const { passwordHash, ...safeUser } = user;



    return user;
  }
}