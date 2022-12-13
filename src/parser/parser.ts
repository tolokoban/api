import CodeExtractor from "./code-extractor.js"
import Tokenizer, { EnumToken, IToken } from "./tokenizer.js"
import {
    IType,
    ITypeObject,
    ITypeAlias,
    ITypeArray,
    ITypeEnum,
    IEntrypoint,
    IError,
    IEnums,
    IAttrib,
    ITypeRecord,
} from "./types.js"
import { ensureFloat, ensureInt, isObject } from "../tools/type-guards.js"
import { parseComment } from "./comment.js"

export default class Parser {
    private readonly publicTypes: { [key: string]: ITypeObject } = {}
    private readonly privateTypes: { [key: string]: IType } = {}

    private readonly tokens: IToken[] = []
    private cursor = 0
    private readonly tokenizer: Tokenizer
    private token: IToken = {
        type: EnumToken.Space,
        pos: 0,
        line: 0,
    }

    constructor(private readonly text: string) {
        this.tokenizer = new Tokenizer(text)
    }

    private back() {
        this.cursor = Math.max(0, this.cursor - 1)
    }

    private next(mandatory: boolean = false): boolean {
        const { tokens, cursor } = this
        if (cursor < tokens.length) {
            this.token = tokens[cursor] as IToken
            this.cursor++
            return true
        }

        if (!this.tokenizer.next()) {
            if (mandatory) throw "Unexpeted end of file!"
            return false
        }
        this.token = this.tokenizer.token as IToken
        tokens.push(this.token)
        this.cursor++
        return true
    }

    parse(): IEntrypoint[] {
        try {
            while (this.next()) {
                const { token } = this
                switch (token.type) {
                    case EnumToken.Export:
                        this.parsePublicInterface()
                        break
                    case EnumToken.Interface:
                        this.parsePrivateInterface()
                        break
                    case EnumToken.Declare:
                        this.parseEnum()
                        break
                    default:
                        throw "This file must define only interfaces!"
                }
            }
        } catch (ex) {
            const { text, token } = this
            const { pos, line } = token || { pos: 0, line: 0 }
            throw `${ex}\n\n${CodeExtractor(text, pos, line)}`
        }

        return this.createMethods()
    }

    private createMethods(): IEntrypoint[] {
        const methods: IEntrypoint[] = []

        for (const methodName of Object.keys(this.publicTypes)) {
            const type = this.publicTypes[methodName] as ITypeObject
            try {
                const input = this.createMethodInput(type)
                const output = this.createMethodOutput(type)
                const errors = this.createMethodErrors(type)
                const dependencies = this.createMethodDependencies(type)
                const { comment, directives } = parseComment(type.comment)
                methods.push({
                    name: makeRestName(methodName),
                    secure: directives.secure,
                    comment,
                    input,
                    output,
                    errors,
                    dependencies,
                })
            } catch (ex) {
                throw `Error in method "${methodName}":\n${ex}\n\n${CodeExtractor(
                    this.text,
                    type.pos || 0,
                    type.line || 1
                )}`
            }
        }
        return methods
    }

    private createMethodDependencies(type: ITypeObject): {
        [key: string]: IType
    } {
        const dependencies: { [key: string]: IType } = {}
        try {
            Parser.recursiveAliasCrawl(type, this.privateTypes, dependencies)
        } catch (ex) {
            if (!isObject(ex)) {
                console.error("Unexpected error!", ex)
                throw ex
            }
            const { name, pos, line } = ex
            if (typeof name !== "string") throw ex
            if (typeof pos !== "number") throw ex
            if (typeof line !== "number") throw ex
            throw `Undefined type: "${name}"
            \n${CodeExtractor(this.text, pos, line)}`
        }
        return dependencies
    }

    private static recursiveAliasCrawl(
        type: IType,
        aliases: { [key: string]: IType },
        dependencies: { [key: string]: IType }
    ) {
        const { kind } = type
        switch (kind) {
            case "alias":
                const typeAlias = type as ITypeAlias
                const subtype = aliases[typeAlias.name]
                if (!subtype) throw typeAlias
                if (!dependencies[typeAlias.name]) {
                    dependencies[typeAlias.name] = subtype
                    Parser.recursiveAliasCrawl(subtype, aliases, dependencies)
                }
                break
            case "array":
                const typeArray = type as ITypeArray
                Parser.recursiveAliasCrawl(
                    typeArray.subtype,
                    aliases,
                    dependencies
                )
                break
            case "object":
                const typeObject = type as ITypeObject
                for (const attVal of Object.values(typeObject.attribs)) {
                    Parser.recursiveAliasCrawl(
                        attVal.type,
                        aliases,
                        dependencies
                    )
                }
                if (typeof typeObject.extends === "string") {
                    const parentName = typeObject.extends
                    const parentType = aliases[parentName]
                    if (typeof parentType === "undefined") {
                        throw {
                            ...typeObject,
                            name: typeObject.extends,
                        }
                    }
                    dependencies[parentName] = parentType
                    typeObject.parentType = parentType
                    Parser.recursiveAliasCrawl(
                        parentType,
                        aliases,
                        dependencies
                    )
                }
                break
            default:
            // Do nothing.
        }
    }

    private createMethodInput(type: ITypeObject): ITypeObject {
        if (!type.attribs["params"]) {
            throw `Missing attribute "params"!`
        }
        const result: IType = type.attribs["params"].type
        if (result.kind !== "object") {
            if (result.kind === "alias") {
                const aliasName = (result as ITypeAlias).name
                const aliasType = this.privateTypes[aliasName]
                if (!aliasType) {
                    throw `Type for attribute "param" is not defined: "${aliasName}"!`
                }
                if (aliasType.kind !== "object") {
                    throw `You declared attribute "param" as "${aliasName}" which is of type "${aliasType.kind}" instead of "object"!`
                }
                return aliasType as ITypeObject
            }
            throw `Attribute "params" must be of type "object" or "alias" but not of type "${result.kind}"!`
        }
        const input = result as ITypeObject
        return {
            ...input,
            comment: "",
        }
    }

    private createMethodOutput(type: ITypeObject): IType {
        if (!type.attribs["result"]) {
            throw `Missing attribute "result"!`
        }
        const result = type.attribs["result"].type
        if (result.kind === "alias") {
            const aliasName = (result as ITypeAlias).name
            const aliasType = this.privateTypes[aliasName]
            return aliasType as IType
        }
        return result
    }

    private createMethodErrors(type: ITypeObject): IError[] {
        if (!type.attribs["error"]) {
            throw `Missing attribute "error"!`
        }
        const result = type.attribs["error"].type
        if (result.kind !== "object") {
            if (result.kind === "alias") {
                const aliasName = (result as ITypeAlias).name
                const aliasType = this.privateTypes[aliasName]
                if (!aliasType) {
                    throw `Type for attribute "error" is not defined: "${aliasName}"!`
                }
                if (aliasType.kind !== "enum") {
                    throw `You declared attribute "error" as "${aliasName}"
which is of type "${aliasType.kind}" instead of "enum"!`
                }
                return convertToErrors(aliasType as ITypeEnum)
            }
            throw `Attribute "params" must be of type "object" or "alias" but not of type "${result.kind}"!`
        }
        return convertToErrors(result as ITypeObject)
    }

    parseAny(): IType {
        this.next(true)
        const { type, comment, value, pos, line } = this.token
        switch (type) {
            case EnumToken.Identifier:
                return {
                    kind: "alias",
                    comment: comment || "",
                    name: `${value}`,
                    pos,
                    line,
                }
            case EnumToken.Number:
                return {
                    kind: "number",
                    comment: comment || "",
                    value: ensureFloat(value),
                }
            case EnumToken.BooleanType:
                return {
                    kind: "boolean",
                    comment: comment || "",
                }
            case EnumToken.NumberType:
                return {
                    kind: "number",
                    comment: comment || "",
                }
            case EnumToken.StringType:
                return {
                    kind: "string",
                    comment: comment || "",
                }
            case EnumToken.ArrayType:
                return this.parseArray()
            case EnumToken.RecordType:
                return this.parseRecord()
            case EnumToken.OpenCurlyBracket:
                this.back()
                return this.parseObject()
            default:
                throw "Not implemented yet!"
        }
    }

    parseObject(): ITypeObject {
        let enumCounter = 0

        const result: ITypeObject = {
            kind: "object",
            attribs: {},
            comment: "",
        }
        this.ensureNextIs(
            EnumToken.OpenCurlyBracket,
            'Expected the interface definition to start with "{"!'
        )
        result.comment = this.token.comment || ""
        while (this.next()) {
            if (this.token.type === EnumToken.CloseCurlyBracket) break

            if (
                this.token.type !== EnumToken.Identifier &&
                this.token.type !== EnumToken.String
            ) {
                throw "Expected an attribute's name here!"
            }
            const attribName = this.token.value || ""
            const comment = this.token.comment || ""
            enumCounter = this.getObjectValue(
                result,
                attribName,
                comment,
                enumCounter
            )
            this.skipToken(EnumToken.Comma)
        }
        return result
    }

    /**
     * Return the enumCounter that could be updated for enums.
     * In Object types, attributes can have only a name and no value.
     * For instance `{ FILE_NOT_FOUND }`.
     * In this cas, they are considered as constant numbers.
     * The above example will be transformed into `{ FILE_NOT_FOUND:_0 }`
     *
     * And this one:
     * `{ A, B: 3, C, D, E: 9: F }`
     * will be transform into this one:
     * `{ A: 0, B: 3, C: 4, D: 5, E: 9: F: 10 }`
     */
    getObjectValue(
        result: ITypeObject,
        attribName: string,
        comment: string,
        enumCounter: number
    ): number {
        let nextEnumCounter = enumCounter
        let optional = false

        this.next(true)
        if (this.token.type === EnumToken.QuestionMark) {
            this.next(true)
            optional = true
        }
        if (this.token.type === EnumToken.Colon) {
            const subtype = this.parseAny()
            if (
                subtype.kind === "number" &&
                typeof subtype.value === "number"
            ) {
                // This attribute has a specific index for enum.
                // So it will start a new sequence.
                nextEnumCounter = subtype.value + 1
            }
            result.attribs[attribName] = {
                comment,
                optional,
                type: subtype,
            }
        } else {
            // This is an enum. (we hope).
            this.back()
            result.attribs[attribName] = {
                comment,
                type: {
                    kind: "number",
                    comment,
                    value: enumCounter,
                },
            }
            nextEnumCounter = enumCounter + 1
        }
        return nextEnumCounter
    }

    parseArray(): ITypeArray {
        this.ensureNextIs(
            EnumToken.OpenAngleBracket,
            'Expected "<" after Array!'
        )
        const subtype = this.parseAny()
        this.ensureNextIs(
            EnumToken.CloseAngleBracket,
            'Expected ">" at the end of Array definition!'
        )
        return {
            kind: "array",
            comment: "",
            subtype,
        }
    }

    parseRecord(): ITypeRecord {
        this.ensureNextIs(
            EnumToken.OpenAngleBracket,
            'Expected "<" after Record!'
        )
        const keyType = this.parseAny()
        if (keyType.kind !== "string") {
            throw "In a Record<>, only strings are accepted as key type!"
        }
        this, this.ensureNextIs(EnumToken.Comma, "A comma was expected here!")
        const subtype = this.parseAny()
        this.ensureNextIs(
            EnumToken.CloseAngleBracket,
            'Expected ">" at the end of Record definition!'
        )
        return {
            kind: "record",
            comment: "",
            subtype,
        }
    }

    ensureNextIs(type: EnumToken, errorMessage: string) {
        this.next(true)
        if (this.token.type !== type) {
            console.error(
                `Expected type was ${type}, but we got ${this.token.type}!`
            )
            throw errorMessage
        }
    }

    ensureNextIsNot(type: EnumToken, errorMessage: string) {
        this.next(true)
        if (this.token.type === type) {
            console.error(errorMessage)
            throw errorMessage
        }
        this.back()
    }

    skipToken(...types: EnumToken[]) {
        if (!this.next()) return
        if (types.indexOf(this.token.type) === -1) {
            this.back()
        }
    }

    /**
     * export interface ReuestFile {
     *   params: { ... },
     *   result: { ... },
     *   error: { ... }
     * }
     */
    parsePublicInterface() {
        const comments: string[] = []
        if (this.token.comment) comments.push(this.token.comment)
        this.ensureNextIs(
            EnumToken.Interface,
            "Only interfaces can be exported!"
        )
        if (this.token.comment) comments.push(this.token.comment)
        this.ensureNextIs(
            EnumToken.Identifier,
            "The name of the interface is expected here!"
        )
        if (this.token.comment) comments.push(this.token.comment)
        const { pos, line } = this.token
        const interfaceName = this.token.value || "?"
        this.ensureNextIsNot(
            EnumToken.Extends,
            `Inheritance is only allowed on private types,
not on exported interfaces!

But you can refer to private types which can inherit.

export interface ${interfaceName} {
    params: I${interfaceName}Params
    result: I${interfaceName}Result
    error: { FAILURE }
}
`
        )
        const type = this.parseObject()
        if (this.token.comment) comments.push(this.token.comment)
        this.publicTypes[interfaceName] = {
            ...type,
            pos,
            line,
            comment: comments.join("\n"),
        }
    }

    /**
     * `interface IFoo { ... }`
     * `interface IFoo extends IBar { ... }`
     */
    parsePrivateInterface() {
        const comments: string[] = []
        if (this.token.comment) comments.push(this.token.comment)
        this.ensureNextIs(
            EnumToken.Identifier,
            "The name of the interface is expected here!"
        )
        if (this.token.comment) comments.push(this.token.comment)
        const aliasName = this.token.value || "?"
        ensureStartsWithCapitalizedI(aliasName)
        if (this.privateTypes[aliasName]) {
            throw `Type "${aliasName}" has already been declared!`
        }

        let parent: string | undefined
        this.next(true)
        if (this.token.type === EnumToken.Extends) {
            this.ensureNextIs(
                EnumToken.Identifier,
                "The name of the interface from which to inherit is exected here!"
            )
            parent = this.token.value
        } else {
            this.back()
        }

        const { pos, line } = this.token
        const type = this.parseObject()
        if (this.token.comment) comments.push(this.token.comment)
        const obj: ITypeObject = {
            ...type,
            pos,
            line,
            extends: parent,
            comment: comments.join("\n"),
        }
        this.privateTypes[aliasName] = obj
    }

    /**
     * `declare enum { FIRST, SECOND = 3, LAST }`
     */
    parseEnum() {
        const comments: string[] = []
        if (this.token.comment) comments.push(this.token.comment)
        this.ensureNextIs(EnumToken.Enum, '"enum" is expected after "declare"!')
        if (this.token.comment) comments.push(this.token.comment)
        this.ensureNextIs(
            EnumToken.Identifier,
            "The enum's name was expected here!"
        )
        const aliasName = this.token.value || "?"
        if (this.privateTypes[aliasName]) {
            throw `Type "${aliasName}" has already been declared!`
        }
        const enums = this.parseEnumValues()
        this.privateTypes[aliasName] = {
            kind: "enum",
            comment: comments.join("\n"),
            enums,
        }
    }

    /**
     * `{ FIRST, SECOND = 3, LAST }`
     */
    parseEnumValues(): IEnums {
        const enums: IEnums = {}
        this.ensureNextIs(
            EnumToken.OpenCurlyBracket,
            'We were expecting a "{" here!'
        )
        let enumValue = 0

        while (this.next()) {
            if (this.tokenTypeIs(EnumToken.Comma)) continue
            if (this.tokenTypeIs(EnumToken.CloseCurlyBracket)) break

            if (!this.tokenTypeIs(EnumToken.Identifier)) {
                throw "Expected an enum's name here!"
            }
            const enumName = this.token.value || ""
            const enumComment = this.token.comment || ""

            if (!this.next()) throw "Unexpected end of file!"
            if (this.tokenTypeIs(EnumToken.Equal)) {
                this.ensureNextIs(
                    EnumToken.Number,
                    "A number was expected here!"
                )
                enumValue = ensureInt(this.token.value)
            } else {
                this.back()
            }
            enums[enumName] = {
                comment: enumComment,
                value: enumValue,
            }
        }

        return enums
    }

    tokenTypeIs(type: EnumToken): boolean {
        return this.token.type === type
    }
}

function convertToErrors(obj: ITypeObject | ITypeEnum): IError[] {
    if (obj.kind === "object") return convertObjectToErrors(obj)
    return convertEnumToErrors(obj)
}

function convertEnumToErrors(obj: ITypeEnum): IError[] {
    return Object.keys(obj.enums).map(name => {
        const item = obj.enums[name] ?? { value: -1, comment: "" }
        return {
            name,
            value: item.value,
            comment: item.comment,
        }
    })
}

function convertObjectToErrors(obj: ITypeObject): IError[] {
    const attribs = obj.attribs
    return Object.keys(attribs)
        .filter((name: string) => attribs[name])
        .map((name: string) => {
            const att = attribs[name] as IAttrib
            if (att.type.kind !== "number") {
                throw `Error code "${name}" must be of type number and not ${att.type.kind}!`
            }
            return {
                name,
                value: ensureInt(att.type.value, -1),
                comment: att.comment,
            }
        })
}

function ensureStartsWithCapitalizedI(name: string) {
    if (!name.startsWith("I"))
        throw `Interface name "${name}" must start with a capitalized I!`
    if (name.length < 3)
        throw `Interface name "${name}" must be at leat 3 characters length!`
    const secondLetter = name.charAt(1)
    if (secondLetter !== secondLetter.toUpperCase())
        throw `Interface name "${name}" must be written "I${name}"!`
}

function makeRestName(name: string): string {
    return name.split("_").join("/")
}
