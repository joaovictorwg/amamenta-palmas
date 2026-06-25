import { createContext } from "react";

import type { User } from "@/types/auth";

export interface AuthContextData {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const AuthContext =
    createContext<AuthContextData>(
        {} as AuthContextData
    );