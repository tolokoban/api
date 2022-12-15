import FS from "fs"
import JSON5 from "json5"
import Readline from "readline-sync"
import { CodeBlock, linearize } from "./tools/linearize.js"
import { print, printDoc, printSuccess } from "./print.js"
import { PROTOCOL_EXAMPLE } from "./constants/index.js"

export function initConfigFile() {
    const code: CodeBlock = []
    printDoc("Let me help you generate a configuration file.")
    const configFilename = Readline.question(
        "Configuration filename [protocol.json5]: ",
        {
            defaultInput: "protocol.json5",
        }
    )
    printDoc(
        "The most important is the API definition file.",
        "It is also called 'protocol'.",
        "",
        "This si a TypeScript file describing all the entrypoints with",
        "their inputs, output and error codes.",
        "",
        "If you don't have one yet, I will generate an example for you."
    )
    const protocolFilename = Readline.question(
        "Protocol filename [protocol.d.ts]: ",
        {
            defaultInput: "protocol.d.ts",
        }
    )
    if (Readline.keyInYN("Generate code for Client ")) {
        const clientPath = Readline.questionPath(
            "Folder where to put code for Client: ",
            { isFile: false }
        )
        if (clientPath) {
            code.push(
                "/** Generate code for Client */",
                `clientPath: ${JSON5.stringify(clientPath)},`
            )
        }
    }
    if (Readline.keyInYN("Generate code for Server ")) {
        const serverPath = Readline.questionPath(
            "Folder where to put code for Server: ",
            { isFile: false }
        )
        if (serverPath) {
            code.push(
                "/** Generate code for Server */",
                `serverPath: ${JSON5.stringify(serverPath)},`
            )
            printDoc(
                "If you build a full scaffolder, a minimum viable project will be created.",
                "You will be able to start the server in dev with this command:",
                "  > npm start",
                "And build it in release mode with this command:",
                "  > npm run build"
            )
            if (Readline.keyInYN("Build full scaffolder ")) {
                code.push(
                    "/**",
                    " * This will also create the following files:",
                    " * - `package.json`",
                    " * - `tsconfig.json`",
                    " * - `index.ts`",
                    " */",
                    "serverScaffolder: true,"
                )
            }
        }
    }
    code.push(
        "/** The following file owns the API definition */",
        `protocol: ${JSON5.stringify(protocolFilename)}`
    )
    if (!FS.existsSync(protocolFilename)) {
        FS.writeFileSync(protocolFilename, PROTOCOL_EXAMPLE)
    }

    FS.writeFileSync(configFilename, linearize(["{", code, "}"]))
    print()
    printSuccess("Done!")
    print("You can use this configuration file like this:")
    print(`  > npx api ${configFilename}`)
    print()
}
