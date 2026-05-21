import type { User } from "../types/auth";

import {
    getStorage,
    removeStorage,
    setStorage,
} from "./storage";

const TOKEN_KEY = "@app/token";
const USER_KEY = "@app/user";

export function saveAuth(
    token: string,
    user: User
) {
    setStorage(TOKEN_KEY, token);

    setStorage(USER_KEY, user);
}

export function getToken() {
    return getStorage<string>(TOKEN_KEY);
}

export function getUser() {
    return getStorage<User>(USER_KEY);
}

export function logout() {
    removeStorage(TOKEN_KEY);

    removeStorage(USER_KEY);
}