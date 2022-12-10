import Chalk from "chalk"

export function print(key: string, value: unknown) {
    if (typeof value === "string") {
        console.log(`${key}:`, Chalk.yellow.bold(value))
        return
    }
    if (typeof value === "number") {
        console.log(`${key}:`, Chalk.cyan.bold(value))
        return
    }
    if (!value) {
        console.log(`${key}:`, Chalk.redBright(JSON.stringify(value)))
        return
    }
    console.log(
        `${key}:`,
        Chalk.yellowBright(JSON.stringify(value, null, "  "))
    )
}

export function fatal(message: string): never {
    console.log(Chalk.bgRed.whiteBright.bold(message))
    process.exit(1)
}

export function warn(...messages: string[]) {
    console.log(messages.map(message => Chalk.redBright(message)).join(" "))
}

export function success(...messages: string[]) {
    console.log(messages.map(message => Chalk.greenBright(message)).join(" "))
}
