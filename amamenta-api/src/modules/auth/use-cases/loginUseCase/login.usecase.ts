import { comparePassword } from "@/shared/utils/hash";
import { UnauthorizedError } from "@/shared/errors/UnauthorizedError";
import { signJwt } from "@/shared/utils/jwt";
import { UserRepository } from "@/modules/users/repositories/user.repository";

interface AuthenticateRequest {
  email: string;
  password: string;
}

export class AuthenticateUserUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute({ email, password }: AuthenticateRequest) {
    const normalizedEmail = email.trim().toLowerCase();

    // buscar usuário
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // validar senha
    const isValid = await comparePassword(
      password,
      user.passwordHash
    );

    if (!isValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!user.isVerified) {
      throw new UnauthorizedError("Email not verified");
    }

    // gerar token
    const token = signJwt({
      sub: user.id,
      role: user.role,
      tenantId: user.tenantId,
    });

    return {
      token, user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }
}
