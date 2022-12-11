import Chalk from "chalk"

export function parseArgs() {
    let inputPath: string | undefined = undefined
    let docPath: string | undefined = undefined
    let clientPath: string | undefined = undefined
    let serverPath: string | undefined = undefined
    const [_node, _file, ...args] = process.argv
    const [input, ...outputs] = args
    if (!input) usage()

    inputPath = input
    for (let i = 0; i < outputs.length; i += 2) {
        const key = outputs[i]
        const val = outputs[i + 1]
        switch (key) {
            case "-d":
            case "--doc":
                docPath = val
                break
            case "-c":
            case "--client":
                clientPath = val
                break
            case "-s":
            case "--server":
                serverPath = val
                break
            default:
                usage()
        }
    }
    console.log("🚀 [args] process.argv = ", process.argv) // @FIXME: Remove this line written on 2022-12-11 at 18:20
    return { inputPath, docPath, clientPath, serverPath }
}

function usage(): never {
    console.log()
    console.log("Usage:")
    console.log(
        Chalk.whiteBright.bold(
            "ts-node-esm api.ts <protocol filename> [--doc <path>] [--client <path>] [--server <path>]"
        )
    )
    console.log()
    process.exit(1)
}
