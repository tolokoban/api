import FS from "fs"
import JSON5 from "json5"
import { initConfigFile } from "./init.js"
import { usage } from "./usage.js"
import { printError } from "./print.js"
import { assertType } from "@tolokoban/type-guards"

export interface Options {
    protocol: string
    docPath?: string
    clientPath?: string
    serverPath?: string
    serverScaffolder?: boolean
    serverType?: "php" | "node"
}

export function parseArgs(): Options {
    const [_node, _file, ...args] = process.argv
    if (args.length === 0) usage()

    let configFilename: string | null = null
    const options: Record<string, string | boolean> = {}
    let currentOptionName: string | null = null
    for (const arg of args) {
        if (arg.startsWith("--")) {
            currentOptionName = arg.substring(2)
            options[currentOptionName] = true
        } else {
            if (currentOptionName) options[currentOptionName] = arg
            else configFilename = arg
        }
    }
    if (options["init"]) {
        initConfigFile()
        process.exit(0)
    }
    const config = parseConfig(configFilename, options)
    if (config) return config
    usage()
}

function parseConfig(
    configFilename: string | null,
    options: Record<string, string | boolean>
): Options | null {
    let data: unknown = options
    if (configFilename) {
        if (FS.existsSync(configFilename)) {
            data = loadJson(configFilename) ?? options
        }
    }
    try {
        assertOptions(data)
        return data
    } catch (ex) {
        printError("Invalid configuration!")
        printError(`${ex}`)
        process.exit(2)
    }
}

function assertOptions(data: unknown): asserts data is Options {
    assertType<Options>(data, {
        protocol: "string",
        docPath: ["?", "string"],
        clientPath: ["?", "string"],
        serverPath: ["?", "string"],
        serverScaffolder: ["?", "boolean"],
        serverType: ["?", ["literal", "php", "node"]],
    })
}

function loadJson(filename: string): unknown {
    try {
        const content = FS.readFileSync(filename).toString()
        return JSON5.parse(content)
    } catch (ex) {
        printError(`"${filename}" is not a valid JSON5 file!`)
        return null
    }
}
