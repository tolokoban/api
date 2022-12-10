export function isNumber(data: unknown): data is number {
    return typeof data === "number"
}

export function isString(data: unknown): data is string {
    return typeof data === "string"
}

export function isObject(data: unknown): data is Record<string, unknown> {
    if (!data) return false
    if (Array.isArray(data)) return false
    return typeof data === "object"
}

export function ensureInt(data: unknown, defaultValue = 0): number {
    if (isNumber(data)) return Math.round(data)
    if (isString(data)) {
        const val = parseInt(data)
        if (isNaN(val)) return defaultValue
        return val
    }
    return defaultValue
}

export function ensureFloat(data: unknown, defaultValue = 0): number {
    if (isNumber(data)) return data
    if (isString(data)) {
        const val = parseFloat(data)
        if (isNaN(val)) return defaultValue
        return val
    }
    return defaultValue
}
