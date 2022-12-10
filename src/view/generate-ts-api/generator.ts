import {
    IEntrypoint,
    IType,
    ITypeObject,
    ITypeAlias,
    ITypeArray,
    ITypeEnum,
} from "../../types"

export default {
    generateCodeForBaseApi() {
        return BASE_API_CODE
    },
    generateCodeForClass,
    generateCodeForEntryPointTypes,
    generateCodeForIdFactory() {
        return ID_FACTORY_CODE
    },
    generateCodeForTypes,
}

function generateCodeForClass(methods: IEntrypoint[]): string {
    const code: string[] = [
        "/* tslint:disable:array-type         */",
        "/* tslint:disable:interface-name     */",
        "/* tslint:disable:no-empty-interface */",
        "/* tslint:disable:no-void-expression */",
        "import BaseApi from './base-api'",
        "import * from './types.ts'",
        "",
        "export default class Api extends BaseApi {",
        "    constructor(hostname: string) { super(hostname) }",
    ]

    for (const method of methods) {
        const name = method.name
        code.push("")
        if (method.comment) {
            code.push(
                "    /**",
                `     * ${method.comment.split("\n").join("\n     * ")}`,
                "     */"
            )
        }
        code.push(
            `    async call${name}(params: IAPI${name}Params): Promise<IAPI${name}Result> {`,
            "        return new Promise(async (resolve, reject) =>",
            `            this.call("${name}", params, resolve, reject))`,
            "}"
        )
    }
    code.push("}", "")
    return code.join("\n")
}

function addDependencies(type: IType, dependencies: Set<string>) {
    if (isTypeObject(type)) {
        addObjectDependencies(type, dependencies)
    } else if (isTypeArray(type)) {
        addDependencies(type.subtype, dependencies)
    } else if (isTypeAlias(type)) {
        dependencies.add(type.name)
    }
}

function addObjectDependencies(type: ITypeObject, dependencies: Set<string>) {
    const ext = type.extends
    if (typeof ext === "string") {
        dependencies.add(ext)
    }
    const { attribs } = type
    for (const attKey of Object.keys(attribs)) {
        const attVal = attribs[attKey]
        addDependencies(attVal.type, dependencies)
    }
}

function generateCodeForEntryPointTypes(methods: IEntrypoint[]): string {
    const code: string[] = ["// tslint:disable: class-name"]

    const dependencies = new Set<string>()
    for (const method of methods) {
        addDependencies(method.input, dependencies)
        addDependencies(method.output, dependencies)
    }
    const imports: string[] = Array.from(dependencies.keys())
    imports.sort((i1: string, i2: string) => i1.localeCompare(i2))
    code.push("import {")
    code.push(`    ${imports.join(",\n    ")}`)
    code.push(`} from './types-api-more'`)

    for (const method of methods) {
        code.push("")
        const name = method.name
        const typeParams = method.input
        if (isTypeObject(typeParams)) {
            code.push(
                ...generateCodeForExportedTypes(`IAPI${name}Params`, typeParams)
            )
        } else {
            code.push(
                `export type IAPI${name}Params = ${getCodeForType(typeParams)}`
            )
        }

        code.push("")
        const typeReturns = method.output
        if (isTypeObject(typeReturns)) {
            code.push(
                ...generateCodeForExportedTypes(
                    `IAPI${name}Result`,
                    typeReturns
                )
            )
        } else {
            code.push(
                `export type IAPI${name}Result = ${getCodeForType(typeReturns)}`
            )
        }
    }
    return code.join("\n")
}

function generateCodeForTypes(methods: IEntrypoint[]): string {
    const code: string[] = []
    const dependencies = new Map<string, IType>()

    for (const method of methods) {
        const name = method.name
        for (const depKey of Object.keys(method.dependencies)) {
            dependencies.set(depKey, method.dependencies[depKey])
        }
    }

    for (const entry of dependencies.entries()) {
        const [name, type] = entry
        if (isTypeObject(type)) {
            code.push(`export interface ${name} ${getCodeForType(type)}`)
        } else if (isTypeEnum(type)) {
            code.push(`export enum ${name} ${getCodeForTypeEnum(type)}`)
        } else {
            code.push(`export type ${name} = ${getCodeForType(type)}`)
        }
        code.push("")
    }

    return code.join("\n")
}

function generateCodeForExportedTypes(
    name: string,
    type: ITypeObject
): string[] {
    const inheritance = type.extends ? ` extends ${type.extends}` : ""
    const code = [`export interface ${name}${inheritance} {`]
    for (const attName of Object.keys(type.attribs)) {
        const att = type.attribs[attName]
        code.push(
            `    ${quoteIfNeeded(attName)}${
                att.optional ? "?" : ""
            }: ${getCodeForType(att.type, 1)}`
        )
    }
    code.push("}")
    return code
}

function getCodeForType(type: IType, indentLevel = 0): string {
    const indent = makeIndent(indentLevel)
    if (isTypeObject(type)) return getCodeForTypeObject(type, indentLevel)
    if (isTypeEnum(type)) return getCodeForTypeEnum(type, indentLevel)
    if (isTypeArray(type))
        return `Array<${tryToInline(
            getCodeForType(type.subtype, indentLevel)
        )}>`
    if (isTypeAlias(type)) return type.name
    switch (type.kind) {
        case "number":
            return "number"
        case "boolean":
            return "boolean"
        case "string":
            return "string"
        default:
            return `${indent}${JSON.stringify(type)}`
    }
}

/**
 * When the code for a type does not span on several lines,
 * and if it is short enough, we can make it inline.
 */
function tryToInline(typeCode: string): string {
    const NOT_FOUND = -1
    const MAX_LENGTH = 40
    const trimedCode = typeCode.trim()
    if (trimedCode.length > MAX_LENGTH) return typeCode
    if (trimedCode.indexOf("\n") !== NOT_FOUND) return typeCode
    return trimedCode
}

function getCodeForTypeObject(type: ITypeObject, indentLevel = 0) {
    const indent = makeIndent(indentLevel)
    const subIndent = makeIndent(indentLevel + 1)
    const code: string[] = ["{"]
    for (const attName of Object.keys(type.attribs)) {
        const att = type.attribs[attName]
        code.push(
            `${subIndent}${quoteIfNeeded(attName)}${
                att.optional ? "?" : ""
            }: ${getCodeForType(att.type, indentLevel + 2)}`
        )
    }
    code.push(`${indent}}`)
    return code.join("\n")
}

function getCodeForTypeEnum(type: ITypeEnum, indentLevel = 0) {
    const indent = makeIndent(indentLevel)
    const subIndent = makeIndent(indentLevel + 1)
    const code: string[] = ["{"]
    for (const name of Object.keys(type.enums)) {
        const item = type.enums[name]
        code.push(`${subIndent}${quoteIfNeeded(name)} = ${item.value},`)
    }
    code.push(`${indent}}`)
    return code.join("\n")
}

function isTypeObject(type: IType): type is ITypeObject {
    return type.kind === "object"
}

function isTypeAlias(type: IType): type is ITypeAlias {
    return type.kind === "alias"
}

function isTypeArray(type: IType): type is ITypeArray {
    return type.kind === "array"
}

function isTypeEnum(type: IType): type is ITypeEnum {
    return type.kind === "enum"
}

function makeIndent(indentLevel: number): string {
    let indent = ""
    for (let i = 0; i < indentLevel; i++) indent += "    "
    return indent
}

function quoteIfNeeded(name: string): string {
    return name
}

const BASE_API_CODE = `import IdFactory from './id-factory'

interface IResultMessage {
    id: string
    result: any
}
interface IErrorMessage {
    id: string
    error: any
}
type IMessage = IErrorMessage | IResultMessage
type IResolve = (output: any) => void
type IReject = (error: IServiceError) => void
interface IServiceError {
    method: string
    params: any
    type: number
    error: any
}
interface IPendingQuery {
    method: string
    params: any
    resolve: IResolve
    reject: IReject
    timeoutId: number
}

const TIMEOUT = 10000

export default class BaseApi {
    private _ws?: WebSocket
    private readonly pendingQueries = new Map<string, IPendingQuery>()

    constructor(private readonly hostname: string) { }

    static readonly ERR_WEBSOCKET = -1
    static readonly ERR_TIMEOUT = -2
    static readonly ERR_SERVICE = -3

    async call(method: string, params: any, resolve: IResolve, reject: IReject) {
        const id = IdFactory.next()
        const message = { id, method, params }
        try {
            this.pendingQueries.set(id, {
                method,
                params,
                resolve,
                reject,
                timeoutId: window.setTimeout(
                    () => {
                        const ex: IServiceError = {
                            method, params,
                            type: BaseApi.ERR_TIMEOUT,
                            error: \`Timeout (\${TIMEOUT} ms) for query "\${method}"\`
                        }
                        console.error(ex)
                        this.pendingQueries.delete(id)
                        reject(ex)
                    },
                    TIMEOUT
                )
            })
            const ws = await this.ws()
            ws.send(JSON.stringify(message))
        } catch (ex) {
            const error: IServiceError = {
                method, params,
                type: BaseApi.ERR_WEBSOCKET,
                error: ex
            }
            console.error(error)
            this.pendingQueries.delete(id)
            reject(error)
        }
    }

    private async ws(): Promise<WebSocket> {
        if (this._ws) return this._ws

        try {
            const ws = new WebSocket(this.hostname, ["tide-js"])
            this._ws = ws
            return new Promise<WebSocket>((resolve, reject) => {
                ws.binaryType = 'arraybuffer'
                ws.addEventListener('open', () => { resolve(ws) })
                ws.addEventListener('message', this.handleMessage)
                ws.addEventListener('close', () => {
                    console.warn("WebSocket closed!")
                    delete this._ws
                    reject("Close")
                })
                ws.addEventListener('error', err => {
                    console.error("WebSocket error: ", err)
                    delete this._ws
                    reject(\`Error: \${err}\`)
                })
            })
        } catch (ex) {
            console.error("Unable to create WebSocket: ", ex)
            throw ex
        }
    }

    private readonly handleMessage = (event: MessageEvent) => {
        const msg = parseResultMessage(event.data)
        if (!msg) return
        const { id } = msg
        const pendingQuery = this.pendingQueries.get(id)
        if (!pendingQuery) {
            console.warn("Unknown ID for WebSocket response:", id)
            return
        }
        window.clearTimeout(pendingQuery.timeoutId)
        this.pendingQueries.delete(id)
        const { resolve, reject } = pendingQuery
        if (isErrorMessage(msg)) {
            reject({
                method: pendingQuery.method,
                params: pendingQuery.params,
                type: BaseApi.ERR_SERVICE,
                error: msg.error
            })
        } else if (isResultMessage(msg)) {
            resolve(msg.result)
        } else {
            console.error("This message does not respect the protocol:", msg)
        }
    }
}

function isErrorMessage(msg: any): msg is IErrorMessage {
    if (!msg) return false
    if (typeof msg.id !== "string") return false
    return typeof msg.error !== 'undefined'
}

function isResultMessage(msg: any): msg is IResultMessage {
    if (!msg) return false
    if (typeof msg.id !== "string") return false
    return typeof msg.result !== 'undefined'
}

function parseResultMessage(msg: string): IMessage | null {
    try {
        const result = JSON.parse(msg)
        if (isResultMessage(result)) return result
        if (isErrorMessage(result)) return result
        console.error("This message does not respect the protocol:", result)
        return null
    } catch (ex) {
        console.error("Invalid JSON: ", msg)
        return null
    }
}`

const ID_FACTORY_CODE = `const ZERO = 0
const BASE64_APHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
const LETTER_SIZE = 63
const LETTER_SHIFT = 6
const MAX_COUNTER = Number.MAX_SAFE_INTEGER - 1
let gCounter = 0

export default {
    next(): string {
        let out = ""
        let counter = gCounter
        while (true) {
            out += BASE64_APHABET.charAt(counter & LETTER_SIZE)
            counter >>= LETTER_SHIFT
            if (counter === ZERO) break
        }
        gCounter++
        return out
    },

    reset() {
        gCounter = 0
    }
}`
