import { UserRole } from "@/modules/users/entities/users.entity";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      role: UserRole;
      tenantId: string | null;
    };
  }
}
