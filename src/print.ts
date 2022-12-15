import Chalk from "chalk"

export function printError(message: string) {
    console.error(Chalk.bgRed.whiteBright.bold(message))
}

export function printDoc(...items: string[]) {
    console.log()
    console.log(Chalk.gray(items.join("\n")))
    console.log()
}

export function printSuccess(...items: string[]) {
    console.log(Chalk.greenBright(items.join(" ")))
}

export function print(...items: string[]) {
    console.log(items.join(" "))
}
