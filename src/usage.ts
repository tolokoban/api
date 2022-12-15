import Chalk from "chalk"

export function usage(): never {
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
