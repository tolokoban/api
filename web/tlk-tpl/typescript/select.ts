import Path from "path"
import Chalk from "chalk"
import ReadLineSync from "readline-sync"
import { listDir } from "./files.js"
import { fatal } from "./print.js"
import Template from "./template.js"

export function input(prompt: string): string {
    return ReadLineSync.question(`${Chalk.yellow(prompt)} > `)
}

export function selectTemplate(templates: Template[]): Template | undefined {
    if (templates.length < 1) fatal("No template found!")

    const options: Array<Template> = [...templates]
    options.sort((t1, t2) => {
        const a = t1.name.trim().toLowerCase()
        const b = t2.name.trim().toLowerCase()
        if (a < b) return -1
        if (a > b) return +1
        return 0
    })
    const index = ReadLineSync.keyInSelect(
        options.map(item =>
            item ? Chalk.blue.bold(item.name) : Chalk.yellowBright("Cancel!")
        ),
        "Select the template to use"
    )
    return options[index]
}

export function selectDir(root: string): string | undefined {
    const { dirs } = listDir(root)
    dirs.sort()
    const options = [root, ...dirs, ".."]
    const index = ReadLineSync.keyInSelect(
        options.map((item, index) => {
            if (index === 0) return Chalk.green.bold(item)
            if (item === "..") return Chalk.yellow("<Up to Parent>")
            return Chalk.blue.bold(`./${item}`)
        }),
        "Select the destination folder"
    )
    if (index < 0) return undefined
    if (index === 0) return root

    return selectDir(Path.resolve(root, options[index] ?? "."))
}
