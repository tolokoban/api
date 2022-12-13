import CodeExtractor from "./code-extractor.js"

export enum EnumToken {
    Space, // 0
    Comment,
    String,
    Interface,
    Declare,
    Enum, // 5
    Export,
    OpenAngleBracket,
    CloseAngleBracket,
    OpenCurlyBracket,
    CloseCurlyBracket, // 10
    OpenSquareBracket,
    CloseSquareBracket,
    Equal,
    Comma,
    Colon, // 15
    Number,
    Pipe,
    Identifier,
    ArrayType,
    RecordType, // 20
    StringType,
    NumberType,
    BooleanType,
    QuestionMark,
    Extends, // 25
}

export interface IToken {
    type: EnumToken
    value?: string
    comment?: string
    pos: number
    line: number
}

const STATIC_TOKENS: Array<[string, EnumToken]> = [
    ["interface", EnumToken.Interface],
    ["<", EnumToken.OpenAngleBracket],
    [">", EnumToken.CloseAngleBracket],
    ["{", EnumToken.OpenCurlyBracket],
    ["}", EnumToken.CloseCurlyBracket],
    //["[", EnumToken.OpenSquareBracket],
    //["]", EnumToken.CloseSquareBracket],
    [":", EnumToken.Colon],
    [",", EnumToken.Comma],
    ["|", EnumToken.Pipe],
    ["=", EnumToken.Equal],
    ["declare", EnumToken.Declare],
    ["enum", EnumToken.Enum],
    ["export", EnumToken.Export],
    ["interface", EnumToken.Interface],
    ["Array", EnumToken.ArrayType],
    ["Record", EnumToken.RecordType],
    ["string", EnumToken.StringType],
    ["number", EnumToken.NumberType],
    ["boolean", EnumToken.BooleanType],
    ["?", EnumToken.QuestionMark],
    ["extends", EnumToken.Extends],
]

const REGEXP_TOKENS: Array<[RegExp, EnumToken]> = [
    [/^[ \t\r]+/g, EnumToken.Space],
    [/^[a-zA-Z_][a-zA-Z0-9_]*/g, EnumToken.Identifier],
    [/^[+-]?[0-9]+/g, EnumToken.Number],
    [/^("(\\"|[^\\"]+)+"|'(\\'|[^\\']+)+')/g, EnumToken.String],
]

export default class Tokenizer {
    private cursor = 0
    private comments: string[] = []
    private pos = 0
    private line = 1
    private current: IToken | null = null

    constructor(private text: string) {}

    private eof() {
        return this.cursor >= this.text.length
    }

    private bulkComments() {
        const result = this.comments.join("\n")
        this.comments = []
        return result
    }

    /**
     * Call this method until it returns false to get the tokens one by one.
     * ```
     * const tokens: IToken[] = []
     * while (tokenizer.next()) {
     *   tokens.push(tokenizer.token)
     * }
     * ```
     */
    next(): boolean {
        try {
            while (true) {
                if (this.eof()) return false
                const token = this.parse()
                if (token.type === EnumToken.Comment) {
                    if (typeof token.value === "string") {
                        this.comments.push(token.value)
                    }
                } else if (token.type !== EnumToken.Space) {
                    this.current = {
                        ...token,
                        comment: this.bulkComments(),
                    }
                    break
                }
            }
            return true
        } catch (ex) {
            throw `${ex}\n\n${this.extractCode()}`
        }
    }

    private parse(): IToken {
        const { text, cursor, pos, line } = this

        if (text.charAt(cursor) === "\n") {
            this.line++
            this.pos = 0
            this.cursor++
            return { type: EnumToken.Space, pos, line }
        }

        if (text.startsWith("//", cursor)) {
            // Single line comment.
            const end = text.indexOf("\n", cursor)
            if (end === -1) return { type: EnumToken.Space, pos, line }
            this.cursor = end
            return {
                type: EnumToken.Comment,
                value: text.substr(cursor + 2, end - cursor - 2),
                pos,
                line,
            }
        }

        if (text.startsWith("/*", cursor)) {
            const end = text.indexOf("*/", cursor + "/*".length)
            if (end === -1) {
                this.cursor = this.text.length
            } else {
                const commentContent = text.substring(cursor, end + "*/".length)
                const commentLines = commentContent.split("\n")
                const commentLastLine = commentLines.pop() as string
                if (commentLines.length === 1) {
                    this.pos += commentLastLine.length
                } else {
                    this.line += commentLines.length
                    this.pos = commentLastLine.length
                }
                this.cursor += commentContent.length
            }
            return { type: EnumToken.Space, pos, line }
        }

        for (const item of STATIC_TOKENS) {
            const [str, typ] = item
            if (text.startsWith(str, cursor)) {
                this.cursor += str.length
                this.pos += str.length
                return { type: typ, value: str, pos, line }
            }
        }

        for (const item of REGEXP_TOKENS) {
            const [rx, typ] = item
            const token = this.match(rx, typ)
            if (token) return token
        }

        throw "Syntax error!"
    }

    private match(rx: RegExp, typ: EnumToken): IToken | null {
        const { text, cursor, pos, line } = this
        rx.lastIndex = 0
        const m = rx.exec(text.substr(cursor))
        if (!m) return null
        const token = {
            type: typ,
            value: m[0],
            pos,
            line,
        }
        this.cursor += token.value.length
        this.pos += token.value.length
        return token
    }

    private extractCode() {
        const { text, pos, line } = this
        return CodeExtractor(text, pos, line)
    }

    get token() {
        return this.current
    }
}
