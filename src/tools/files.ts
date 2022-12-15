import FS from "fs"
import Path from "path"
import Chalk from "chalk"

export function isDir(path: string): boolean {
    if (!FS.existsSync(path)) return false

    const stat = FS.statSync(path)
    return stat.isDirectory()
}

export function isFile(path: string): boolean {
    if (!FS.existsSync(path)) return false

    const stat = FS.statSync(path)
    return stat.isFile()
}

export function writeFile(
    filename: string,
    content: string,
    overwrite = false
) {
    const relativeFilename = Path.relative(".", filename)
    if (!overwrite && FS.existsSync(filename)) {
        console.log(Chalk.grey("File skipped:  "), relativeFilename)
        return
    }
    console.log(Chalk.green("File generated:"), Chalk.bold(relativeFilename))
    FS.writeFileSync(filename, content)
}

export function exists(path: string) {
    return FS.existsSync(path)
}

export function mkdir(path: string) {
    FS.mkdirSync(path, { mode: 0o777, recursive: true })
}
