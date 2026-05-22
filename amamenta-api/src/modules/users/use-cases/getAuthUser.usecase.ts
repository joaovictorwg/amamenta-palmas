import { UserRepository } from "../repositories/user.repository";

import { UserRole } from "../entities/users.entity";

export type PublicUser = {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
};

export class GetAuthUserUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
  }
}