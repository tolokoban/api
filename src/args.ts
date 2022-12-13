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
        const key = outputs[i]?.toLocaleLowerCase()
        const val = outputs[i + 1]
        switch (key) {
            case "doc":
                docPath = val
                break
            case "cli":
            case "client":
                clientPath = val
                break
            case "server":
            case "svr":
            case "srv":
                serverPath = val
                break
            default:
                usage()
        }
    }
    return { inputPath, docPath, clientPath, serverPath }
}

function usage(): never {
    console.log()
    console.log("Usage:")
    console.log(
        Chalk.whiteBright.bold(
            "ts-node-esm api.ts <protocol filename> [DOC <path>] [CLIENT <path>] [SERVER <path>]"
        )
    )
    console.log()
    process.exit(1)
}
