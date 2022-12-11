import FS from "fs"

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
