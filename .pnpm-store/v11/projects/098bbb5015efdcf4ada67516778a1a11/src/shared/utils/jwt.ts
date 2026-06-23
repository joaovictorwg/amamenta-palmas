import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface EmailVerificationPayload {
  sub: string;
  email: string;
  purpose: "email_verification";
}

export function signJwt(payload: object) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as any,
  });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, env.jwtSecret);
}

export function signEmailVerificationToken(payload: EmailVerificationPayload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: "30m",
  });
}

export function verifyEmailVerificationToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as EmailVerificationPayload;
}


