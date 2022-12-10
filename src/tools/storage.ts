export function storageGet(key: string, defaultValue = ""): string {
    const value = window.localStorage.getItem(key)
    return value ?? defaultValue
}

export function storageSet(key: string, value: string) {
    window.localStorage.setItem(key, value)
}
