import Path from "path"
import { IEntrypoint } from "../parser/types.js"
import { capitalizedCamelCase } from "../tools/case.js"
import { isDir, mkdir, writeFile } from "../tools/files.js"
import { CodeBlock, linearize } from "../tools/linearize.js"
import {
    generateAsserts,
    generateComment,
    generateEntrypointsTypes,
    generateTypeGuard,
    generateTypeImplementation,
    prefix,
} from "./common.js"
import {
    SERVER_INDEX,
    SERVER_PACKAGE,
    SERVER_TSCONFIG,
} from "../constants/index.js"
import { SERVER } from "../constants/index.js"
import { applyTemplate } from "./template.js"

export function generateServer(
    root: string | undefined,
    protocol: IEntrypoint[],
    scaffolder = false
) {
    if (!root) return

    if (!isDir(root)) {
        throw Error(`Folder does not exist: ${root}`)
    }

    const src = Path.resolve(root, "src")
    const imports: CodeBlock = []
    const handlers: CodeBlock = []
    const routes: CodeBlock = []
    const typeGuards: CodeBlock = []
    const types = new Set<string>()
    for (const entrypoint of protocol) {
        const name = capitalizedCamelCase(entrypoint.name)
        const path = `routes/${entrypoint.name}`
        imports.push(`import implement${name} from "./${path}/index.js"`)
        generateImplementationFileIfNotAlreadyDone(
            entrypoint,
            scaffolder ? src : root,
            path
        )
        handlers.push(
            `private readonly on${name}: ApiHandler<Params${name}, Result${name}, Errors${name}> = implement${name}`
        )
        routes.push(
            `this.post("/${entrypoint.name}", isParams${name}, this.on${name}, ${entrypoint.secure})`
        )
        typeGuards.push(
            ...prefix(
                generateTypeGuard(entrypoint.input, `Params${name}`, types),
                `export function isParams${name}`
            )
        )
    }
    const content = applyTemplate(SERVER, {
        ERRORS: generateErrors(protocol),
        HANDLERS: handlers,
        IMPORTS: imports,
        ROUTES: routes,
        TYPES: [
            ...generateEntrypointsTypes(protocol),
            ...generateAsserts(types),
        ],
        TYPE_GUARDS: typeGuards,
    })
    if (scaffolder) {
        mkdir(src)
        writeFile(Path.resolve(src, "api.ts"), content, true)
        writeFile(Path.resolve(src, "index.ts"), SERVER_INDEX, false)
        writeFile(Path.resolve(root, "package.json"), SERVER_PACKAGE, false)
        writeFile(Path.resolve(root, "tsconfig.json"), SERVER_TSCONFIG, false)
    } else {
        writeFile(Path.resolve(root, "api.ts"), content, true)
    }
}

function generateImplementationFileIfNotAlreadyDone(
    entrypoint: IEntrypoint,
    root: string,
    path: string
) {
    const name = capitalizedCamelCase(entrypoint.name)
    const absPath = Path.resolve(root, path)
    mkdir(absPath)
    const code: CodeBlock = [
        "import {",
        [`Params${name},`, `Result${name},`, `Errors${name},`, "ApiContext"],
        `} from "${path
            .split("/")
            .map(() => "..")
            .join("/")}/api.js"`,
        "",
        ...generateComment(entrypoint.comment),
        "export default async function(",
        [
            ...generateComment(entrypoint.input.comment),
            `params: Params${name},`,
            "/**",
            " * The context gives you access to the authentication token",
            " * and to a function to throw errors (`context.fatal`).",
            " */",
            `context: ApiContext<Errors${name}>`,
        ],
        `): Promise<Result${name}> {`,
        [
            "// @TODO: Implement this route.",
            "console.log(params)",
            "console.log(context)",
            ...prefix(generateTypeImplementation(entrypoint.output), "return "),
        ],
        "}",
    ]
    writeFile(Path.resolve(absPath, "index.ts"), linearize(code), false)
}

function generateErrors(protocol: IEntrypoint[]): CodeBlock {
    const code: CodeBlock = protocol.map(
        entrypoint =>
            `"${entrypoint.name}": [${entrypoint.errors
                .map(item => `"${item.name} (#${item.value})"`)
                .join(", ")}],`
    )
    return code
}
