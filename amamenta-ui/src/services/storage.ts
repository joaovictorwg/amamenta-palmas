export function setStorage(
    key: string,
    value: unknown
) {
    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}

export function getStorage<T>(
    key: string
): T | null {
    const item = localStorage.getItem(key);

    if (!item) {
        return null;
    }

    return JSON.parse(item);
}

export function removeStorage(key: string) {
    localStorage.removeItem(key);
}