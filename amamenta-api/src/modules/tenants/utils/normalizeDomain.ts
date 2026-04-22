import { AppError } from "@/shared/errors/AppError";

export function normalizeDomain(input: string): string {
    const normalized = input.trim().toLowerCase();
    const domain = normalized.includes("@")
        ? normalized.split("@").pop() ?? ""
        : normalized;

    if (!domain || !domain.includes(".")) {
        throw new AppError("Invalid tenant domain");
    }

    return domain;
}