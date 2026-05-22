import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext/useAuth";
import type { UserRole } from "../types/auth";

type Props = {
    children: ReactElement;
    allowedRoles: UserRole[];
};

export default function ProtectedRoute({
    children,
    allowedRoles,
}: Props) {
    const { user, loading } = useAuth();
    if (loading) {
        return null;
    }

    if (!user) {
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