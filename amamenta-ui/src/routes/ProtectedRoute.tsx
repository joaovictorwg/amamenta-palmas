import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../services/auth";
import type { UserRole } from "../types/auth";

type Props = {
    children: ReactElement;
    allowedRoles: UserRole[];
};

export default function ProtectedRoute({
    children,
    allowedRoles,
}: Props) {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
        return (
            <Navigate to="/login" replace />
        );
    }

    const hasPermission = allowedRoles.includes(
        user.role
    );

    if (!hasPermission) {
        return (
            <Navigate
                to="/unauthorized"
                replace
            />
        );
    }

    return children;
}