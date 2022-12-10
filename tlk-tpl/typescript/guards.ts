export function assertString(
    data: unknown,
    name: string
): asserts data is string {
    if (typeof data !== "string") {
        throw Error(`${name} was expected to be a string!`)
    }
}

export function assertObject(
    data: unknown,
    name: string
): asserts data is Record<string, unknown> {
    if (!data || Array.isArray(data) || typeof data !== "object") {
        throw Error(`${name} was expected to be a object!`)
    }
}
