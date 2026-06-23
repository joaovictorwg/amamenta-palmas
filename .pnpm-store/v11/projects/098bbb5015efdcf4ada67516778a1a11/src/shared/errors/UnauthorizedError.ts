import { AppError } from "./AppError";

export class UnauthorizedError extends AppError {
  constructor(resource: string) {
    super(`${resource} Unauthorized`, 401);
  }
}
