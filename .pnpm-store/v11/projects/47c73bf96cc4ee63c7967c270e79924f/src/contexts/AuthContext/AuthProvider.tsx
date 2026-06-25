import {
    useEffect,
    useState,
} from "react";

import { api } from "@/services/api";

import {
    clearToken,
    getToken,
} from "@/services/auth";

import type { User } from "@/types/auth";

import { AuthContext } from "./AuthContext";

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] =
        useState<User | null>(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        async function loadUser() {
            try {
                const token = getToken();

                if (!token) {
                    setLoading(false);
                    return;
                }

                const response =
                    await api.get(
                        "/auth/user"
                    );

                setUser(
                    response.data.user
                );
            } catch {
                clearToken();
            } finally {
                setLoading(false);
            }
        }

        void loadUser();
    }, []);

    function logout() {
        clearToken();

        setUser(null);

        window.location.href =
            "/login";
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                setUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}