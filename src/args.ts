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
        Chalk.yellowBright.bold(
            "npx @tolokoban/api <protocol filename> [DOC <path>] [CLIENT <path>] [SERVER <path>]"
        )
    )
    console.log()
    console.log(
        "",
        Chalk.yellow("<protocol filename>"),
        "is a file describing the API in a subset of Typescript"
    )
    console.log(
        "",
        Chalk.yellow("CLIENT <path>"),
        "if given, generates the Client code in <path>."
    )
    console.log(
        "",
        Chalk.yellow("SERVER <path>"),
        "if given, generates the Server code in <path>."
    )
    console.log()
    process.exit(1)
}
