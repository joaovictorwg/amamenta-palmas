import {
    getStorage,
    removeStorage,
    setStorage,
} from "./storage";

const TOKEN_KEY = "@app/token";

export function saveToken(token: string) {
    setStorage(TOKEN_KEY, token);
}

export function getToken() {
    return getStorage<string>(TOKEN_KEY);
}

export function clearToken() {
    removeStorage(TOKEN_KEY);
}