import FS from "fs"
import Path from "path"
import { IEntrypoint } from "../parser/types.js"
import { capitalizedCamelCase } from "../tools/case.js"
import { isDir } from "../tools/files.js"
import { CodeBlock, linearize } from "../tools/linearize.js"
import {
    generateAsserts,
    generateComment,
    generateType,
    generateTypeGuard,
    prefix,
} from "./common.js"
import { CLIENT } from "./constants/client.js"
import { applyTemplate } from "./template.js"

export function generateClient(
    path: string | undefined,
    protocol: IEntrypoint[]
) {
    if (!path) return

    if (!isDir(path)) {
        throw Error(`Folder does not exist: ${path}`)
    }

    const errorTypes: CodeBlock = []
    const inputTypes: CodeBlock = []
    const outputTypes: CodeBlock = []
    const typeGuards: CodeBlock = []
    const methods: CodeBlock = []
    const types = new Set<string>()
    for (const entrypoint of protocol) {
        const name = capitalizedCamelCase(entrypoint.name)
        typeGuards.push(
            ...prefix(
                generateTypeGuard(entrypoint.output, `Result${name}`, types),
                `function isResult${name}`
            )
        )
        methods.push(
            "",
            ...generateComment(makeJSDocComment(entrypoint)),
            `async call${name}(params: Params${name}): `,
            [`Promise<Result${name} | Errors${name} | ClientErrors>`],
            "{",
            [
                "try {",
                [
                    `const result = await this.post("${entrypoint.name}", params, isResult${name})`,
                    "switch (typeof result) {",
                    [
                        `case "string": return result`,
                        `case "number":`,
                        [
                            "switch (result) {",
                            entrypoint.errors.map(
                                err =>
                                    `case ${err.value}: return ${JSON.stringify(
                                        err.name
                                    )}`
                            ),
                            "}",
                            `return "_UNEXPECTED_ERROR_"`,
                        ],
                    ],
                    "}",
                    "return result",
                ],
                "} catch (ex) {",
                ["console.error(ex)", 'return "_NETWORK_ERROR_"'],
                "}",
            ],
            "}"
        )
        inputTypes.push(
            ...prefix(
                generateType(entrypoint.input),
                `export interface Params${name} `
            )
        )
        outputTypes.push(
            ...prefix(
                generateType(entrypoint.output),
                `export interface Result${name} `
            )
        )
        if (entrypoint.errors.length === 0) {
            errorTypes.push(`type Errors${name} = ""`)
        } else {
            errorTypes.push(
                `type Errors${name} = `,
                entrypoint.errors.map(err => `| ${JSON.stringify(err.name)}`)
            )
        }
    }
    const code = applyTemplate(CLIENT, {
        INPUT_TYPES: inputTypes,
        OUTPUT_TYPES: outputTypes,
        ERROR_TYPES: errorTypes,
        TYPE_GUARDS: typeGuards,
        ASSERTS: generateAsserts(types),
        METHODS: methods,
    })
    FS.writeFileSync(Path.resolve(path, "client.ts"), code)
}

/**
 *
 * @param entrypoint
 * @returns
 * @throws
 */
function makeJSDocComment(entrypoint: IEntrypoint): string {
    const code: CodeBlock = [entrypoint.comment]
    if (entrypoint.output.comment.trim().length > 0) {
        code.push(`@returns ${entrypoint.output.comment.trim()}`)
    }
    if (entrypoint.errors.length > 0) {
        code.push(
            "@throws nothing, but can return one of this errors:",
            entrypoint.errors.map(
                err =>
                    `- \`"${err.name}"\`${
                        err.comment.trim().length > 0 ? `: ${err.comment}` : ""
                    }`
            )
        )
    }
    return linearize(code)
}
