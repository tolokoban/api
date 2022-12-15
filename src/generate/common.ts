import { IType, ITypeArray, ITypeObject, IEntrypoint } from "../parser/types.js"
import { capitalizedCamelCase } from "../tools/case.js"
import { CodeBlock } from "../tools/linearize.js"
import { isNumber, isString } from "../tools/type-guards.js"

export function generateEntrypointsTypes(
    entrypoints: IEntrypoint[]
): CodeBlock {
    const code: CodeBlock = []
    for (const entrypoint of entrypoints) {
        const name = capitalizedCamelCase(entrypoint.name)
        code.push(
            ...prefix(
                generateType(entrypoint.input),
                `export interface Params${name} `
            ),
            ...prefix(
                generateType(entrypoint.output),
                `export interface Result${name} `
            ),
            `export enum Errors${name} {`,
            ...entrypoint.errors.map(err => [
                ...generateComment(err.comment),
                `${err.name} = ${err.value},`,
            ]),
            "}"
        )
    }
    return code
}

export function generateType(type: IType): CodeBlock {
    switch (type.kind) {
        case "alias":
            return [type.name]
        case "array":
            return generateTypeArray(type)
        case "enum":
            return [
                "{",
                Object.keys(type.enums).map(
                    name => `${name} = ${type.enums[name]?.value},`
                ),
                "}",
            ]
        case "boolean":
            return ["boolean"]
        case "number":
            if (isNumber(type.value)) return [JSON.stringify(type.value)]
            return ["number"]
        case "string":
            if (isString(type.value)) return [JSON.stringify(type.value)]
            return ["string"]
        case "object":
            return generateTypeObject(type)
        case "record":
            return surround(generateType(type.subtype), "Record<string, ", ">")
        default:
            return [`// ERROR! ${JSON.stringify(type)}`]
    }
}

export function generateTypeImplementation(type: IType): CodeBlock {
    switch (type.kind) {
        case "alias":
            return [`unknown /* ${type.name} */`]
        case "array":
            return ["[]"]
        case "boolean":
            return ["false"]
        case "enum":
            return [`${Object.keys(type.enums)[0]}`]
        case "number":
            return [`${type.value ?? 0}`]
        case "object":
            return surround(
                Object.keys(type.attribs).map(name =>
                    surround(
                        generateTypeImplementation(
                            type.attribs[name]?.type as IType
                        ),
                        `${name}: `,
                        ","
                    )
                ),
                "{",
                "}"
            )
        case "record":
            return ["{}"]
        case "string":
            return [type.value ?? '"Any string..."']
        case "union":
            return generateTypeImplementation(type.types[0] as IType)
    }
}

export function generateTypeGuard(
    type: IType,
    name: string,
    types: Set<string>
): CodeBlock {
    const code: CodeBlock = [
        `(data: unknown): data is ${name} {`,
        [
            "try {",
            [
                ...recursiveTypeGuard(type, "data", "data", 1, types),
                "return true",
            ],
            "} catch (ex) {",
            [
                'if (ex instanceof Error) console.error("###", ex.message)',
                "else console.error(ex)",
                "return false",
            ],
            "}",
        ],
        "}",
        "",
    ]
    return code
}

function recursiveTypeGuard(
    type: IType,
    prefixName: string,
    prefixLabel: string,
    level: number,
    types: Set<string>
): CodeBlock {
    switch (type.kind) {
        case "array":
            types.add("array")
            return [
                `assertArray(${prefixName}, "${prefixLabel}")`,
                `for (let idx${level} = 0; idx${level} < ${prefixName}.length ; idx${level}++) {`,
                [
                    `const ${prefixName}_idx${level} = ${prefixName}[idx${level}]`,
                    ...recursiveTypeGuard(
                        type.subtype,
                        `${prefixName}_idx${level}`,
                        `${prefixName}[index]`,
                        level + 1,
                        types
                    ),
                ],
                "}",
            ]
        case "boolean":
            types.add("boolean")
            return [`assertBoolean(${prefixName}, "${prefixLabel}")`]
        case "enum":
        case "number":
            types.add("number")
            return [`assertNumber(${prefixName}, "${prefixLabel}")`]
        case "string":
            types.add("string")
            return [`assertString(${prefixName}, "${prefixLabel}")`]
        case "object":
            types.add("object")
            const codeObject: CodeBlock = [
                `assertObject(${prefixName}, "${prefixLabel}")`,
            ]
            for (const key of Object.keys(type.attribs)) {
                codeObject.push(
                    `const ${prefixName}_${key} = ${prefixName}["${key}"]`
                )
                for (const item of recursiveTypeGuard(
                    type.attribs[key]?.type as IType,
                    `${prefixName}_${key}`,
                    `${prefixName}.${key}`,
                    level + 1,
                    types
                )) {
                    codeObject.push(item)
                }
            }
            return codeObject
        case "record":
            types.add("object")
            return [
                `assertObject(${prefixName}, "${prefixLabel}")`,
                `for (const key${level} of Object.keys(${prefixName})) {`,
                [
                    `const ${prefixName}_key${level} = ${prefixName}[key${level}]`,
                    ...recursiveTypeGuard(
                        type.subtype,
                        `${prefixName}_key${level}`,
                        `${prefixName}[key]`,
                        level + 1,
                        types
                    ),
                ],
                "}",
            ]
        default:
            return [`// Don't know how to deal with this type: ${type.kind}!`]
    }
}

export function generateAsserts(types: Set<string>): CodeBlock {
    const code: CodeBlock = []
    if (types.has("boolean"))
        code.push(
            `function assertBoolean(data: unknown, prefix: string): asserts data is boolean {
    if (typeof data === "boolean") return
    throw Error(\`\${prefix} was expected to be a Boolean!\`)
}`
        )
    if (types.has("number"))
        code.push(`function assertNumber(data: unknown, prefix: string): asserts data is number {
    if (typeof data === "number") return
    throw Error(\`\${prefix} was expected to be a Number!\`)
}`)
    if (types.has("string"))
        code.push(`function assertString(data: unknown, prefix: string): asserts data is string {
    if (typeof data === "string") return
    throw Error(\`\${prefix} was expected to be a String!\`)
}`)
    if (types.has("object"))
        code.push(`function assertObject(
    data: unknown,
    prefix: string
): asserts data is Record<string, unknown> {
    if (data && !Array.isArray(data) && typeof data === "object") return
    throw Error(\`\${prefix} was expected to be an Object!\`)
}`)
    if (types.has("array"))
        code.push(`function assertArray(data: unknown, prefix: string): asserts data is unknown[] {
    if (Array.isArray(data)) return
    throw Error(\`\${prefix} was expected to be an Array!\`)
}`)
    return code
}

function generateTypeArray(type: ITypeArray): CodeBlock {
    const code = generateType(type.subtype)
    return surround(code, "Array<", ">")
}

function generateTypeObject(type: ITypeObject): CodeBlock {
    const attribs: CodeBlock = []
    for (const name of Object.keys(type.attribs)) {
        const attrib = type.attribs[name]
        if (!attrib) continue

        attribs.push(
            ...generateComment(attrib.comment),
            ...prefix(
                generateType(attrib.type),
                `${name}${attrib.optional ? "?" : ""}: `
            )
        )
    }
    return surround(attribs, "{", "}")
}

export function generateComment(comment: string): string[] {
    if (comment.trim().length === 0) return []

    const lines = comment.split("\n")
    if (lines.length === 1) {
        return [`/** ${lines[0]} */`]
    }
    return ["/**", ...lines.map(line => ` * ${line}`), " */"]
}

export function prefix(code: CodeBlock, text: string): CodeBlock {
    const [top] = code
    if (!top) return code
    if (isString(top)) {
        code[0] = `${text}${top}`
    } else {
        prefix(top, text)
    }
    return code
}

export function surround(
    code: CodeBlock,
    prefix: string,
    suffix: string
): CodeBlock {
    if (code.length === 1) {
        const [item] = code
        if (!item) return [prefix, suffix]

        if (isString(item)) {
            code[0] = `${prefix}${item}${suffix}`
        } else {
            surround(item, prefix, suffix)
        }
        return code
    }
    return [prefix, code, suffix]
}
