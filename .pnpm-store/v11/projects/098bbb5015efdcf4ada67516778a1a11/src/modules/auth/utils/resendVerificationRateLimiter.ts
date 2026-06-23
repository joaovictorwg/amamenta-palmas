import { AppError } from "@/shared/errors/AppError";

const resendAttempts = new Map<string, number>();
const RESEND_COOLDOWN_MS = 60 * 1000;

export function assertCanResendVerification(email: string) {
    const now = Date.now();
    const lastAttempt = resendAttempts.get(email);

    if (lastAttempt && now - lastAttempt < RESEND_COOLDOWN_MS) {
        throw new AppError(
            "Please wait before requesting a new verification email.",
            429
        );
    }

    resendAttempts.set(email, now);
}