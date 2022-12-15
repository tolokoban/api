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

export function assertBoolean(
    data: unknown,
    prefix: string
): asserts data is boolean {
    if (typeof data === "boolean") return
    throw Error(`${prefix} was expected to be a Boolean!`)
}

export function assertNumber(
    data: unknown,
    prefix: string
): asserts data is number {
    if (typeof data === "number") return
    throw Error(`${prefix} was expected to be a Number!`)
}

export function assertString(
    data: unknown,
    prefix: string
): asserts data is string {
    if (typeof data === "string") return
    throw Error(`${prefix} was expected to be a String!`)
}

export function assertObject(
    data: unknown,
    prefix: string
): asserts data is Record<string, unknown> {
    if (data && !Array.isArray(data) && typeof data === "object") return
    throw Error(`${prefix} was expected to be an Object!`)
}

export function assertArray(
    data: unknown,
    prefix: string
): asserts data is unknown[] {
    if (Array.isArray(data)) return
    throw Error(`${prefix} was expected to be an Array!`)
}
