import Chalk from "chalk"
import FS from "fs"
import Path from "path"
import { IEntrypoint } from "../parser/types.js"
import { capitalizedCamelCase } from "../tools/case.js"
import { isDir } from "../tools/files.js"
import { CodeBlock, linearize } from "../tools/linearize.js"
import {
    generateAsserts,
    generateComment,
    generateEntrypointsTypes,
    generateTypeGuard,
    generateTypeImplementation,
    prefix,
} from "./common.js"
import { SERVER } from "./constants/server.js"
import { applyTemplate } from "./template.js"

export function generateServer(
    root: string | undefined,
    protocol: IEntrypoint[]
) {
    if (!root) return

    if (!isDir(root)) {
        throw Error(`Folder does not exist: ${root}`)
    }

    const imports: CodeBlock = []
    const handlers: CodeBlock = []
    const routes: CodeBlock = []
    const typeGuards: CodeBlock = []
    const types = new Set<string>()
    for (const entrypoint of protocol) {
        const name = capitalizedCamelCase(entrypoint.name)
        const path = `routes/${entrypoint.name}`
        imports.push(`import implement${name} from "./${path}/index.js"`)
        generateImplementationFileIfNotAlreadyDone(entrypoint, root, path)
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
        IMPORTS: imports,
        HANDLERS: handlers,
        ROUTES: routes,
        TYPES: [
            ...generateEntrypointsTypes(protocol),
            ...generateAsserts(types),
        ],
        TYPE_GUARDS: typeGuards,
    })
    FS.writeFileSync(Path.resolve(root, "api.ts"), content)
}

function generateImplementationFileIfNotAlreadyDone(
    entrypoint: IEntrypoint,
    root: string,
    path: string
) {
    const name = capitalizedCamelCase(entrypoint.name)
    const absPath = Path.resolve(root, path)
    FS.mkdirSync(absPath, { recursive: true, mode: 0o777 })
    if (FS.existsSync(Path.resolve(absPath, "index.ts"))) {
        console.log(Chalk.gray("Route already implemented:"), entrypoint.name)
        return
    }

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
            ...prefix(generateTypeImplementation(entrypoint.output), "return "),
        ],
        "}",
    ]
    FS.writeFileSync(Path.resolve(absPath, "index.ts"), linearize(code))
}
