export function setStorage(
    key: string,
    value: unknown
) {
    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}

export function getStorage<T>(key: string): T | null {
    const item = localStorage.getItem(key);

    if (!item) {
        return null;
    }

    try {
        return JSON.parse(item) as T;
    } catch {
        localStorage.removeItem(key);
        return null;
    }
}

export function removeStorage(key: string) {
    localStorage.removeItem(key);
}