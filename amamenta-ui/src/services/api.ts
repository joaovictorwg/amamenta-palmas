import axios from "axios";

import {
    getToken,
    clearToken,
} from "./auth";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers.Authorization =
            `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,

    (error) => {
        if (error.response?.status === 401) {
            clearToken();

            const publicRoutes = [
                "/login",
                "/forgot-password",
                "/reset-password",
                "/accept-invite",
            ];
            const isPublicRoute = publicRoutes.some((route) =>
                window.location.pathname.startsWith(route)
            );

            if (!isPublicRoute) {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);
