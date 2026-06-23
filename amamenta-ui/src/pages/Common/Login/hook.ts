import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { api } from "@/services/api";
import { clearToken, saveToken } from "@/services/auth";

import { ALLOWED_DASHBOARD_ROLES, ROLES } from "@/constants/roles";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext/useAuth";

interface Errors {
    email?: string;
    password?: string;
}

export function useLogin() {
    const navigate = useNavigate();

    const { t } = useTranslation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState<Errors>({});

    const { setUser } = useAuth();

    function clearError(field: keyof Errors) {
        setErrors((prev) => ({
            ...prev,
            [field]: "",
            general: "",
        }));
    }

    function validate() {
        const newErrors: Errors = {};

        if (!email.trim()) {
            newErrors.email = t("amamenta.error.requiredEmail");
        }

        if (!password.trim()) {
            newErrors.password = t("amamenta.error.requiredPassword");
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);

            const response = await api.post("/auth/login", {
                email,
                password,
            });

            const { token, user } = response.data;

            saveToken(token);

            setUser(user);;

            if (user.role === ROLES.SUPER_ADMIN) {
                navigate("/app-configuration");
                return;
            }

            if (ALLOWED_DASHBOARD_ROLES.includes(user.role)) {
                navigate("/");
            } else {
                clearToken();
                setUser(null);
                navigate("/login");
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;

                if ([400, 401, 403].includes(status ?? 0)) {
                    setErrors({
                        email: t("amamenta.error.invalidCredentials"),
                        password: t("amamenta.error.invalidCredentials"),
                    });
                } else {
                    setErrors({
                        email: t("amamenta.error.internalError"),
                        password: t("amamenta.error.internalError"),
                    });
                }
            } else {
                setErrors({
                    email: t("amamenta.error.unexpectedError"),
                    password: t("amamenta.error.unexpectedError"),
                });
            }
        }
        finally {
            setLoading(false);
        }
    }

    return {
        email,
        setEmail,
        password,
        setPassword,
        loading,
        errors,
        clearError,
        handleLogin,
    };
}
