import JSON5 from "json5"
import Path from "path"
import apply from "./apply.js"
import {
    filterExists,
    findAllDirsRecursively,
    findAllFilesRecursively,
    listDir,
    loadJsonFile,
    loadTextFile,
    makeDirsIfNeeded,
    saveTextFile,
} from "./files.js"
import { assertObject, assertString } from "./guards.js"
import { askParamsValues } from "./params.js"
import { warn } from "./print.js"

export interface TemplateParam {
    name: string
    label: string
}

export default class Template {
    public static all(templatesRoot: string): Template[] {
        const templates: Template[] = []
        const { dirs } = listDir(templatesRoot)
        for (const subPath of dirs) {
            const path = Path.resolve(templatesRoot, subPath)
            try {
                const definition = loadJsonFile(Path.resolve(path, "@.json5"))
                if (!definition) continue

                const { name, params } = definition
                assertString(name, "name")
                assertObject(params, "params")
                templates.push(new Template(name, path, params))
            } catch (ex) {
                warn("Invalid template definition!")
                warn("   ", path)
                warn("   ", JSON5.stringify(ex))
            }
        }
        return templates
    }

    public readonly params: Record<string, TemplateParam> = {}

    private constructor(
        public readonly name: string,
        public readonly path: string,
        params: Record<string, unknown>
    ) {
        for (const key of Object.keys(params)) {
            const val = params[key]
            if (typeof val === "string") {
                this.params[key] = {
                    name: key,
                    label: val,
                }
            }
        }
    }

    copyTo(destination: string) {
        const srcDirs = findAllDirsRecursively(this.path)
        const srcFiles = findAllFilesRecursively(this.path)
        const params = askParamsValues(this.params)
        const dstDirs = srcDirs.map(relativePath =>
            Path.resolve(destination, apply(relativePath, params))
        )
        const dstFiles = srcFiles.map(relativePath =>
            Path.resolve(destination, apply(relativePath, params))
        )
        const alreadyExistingFiles = dstFiles.filter(filterExists)
        if (alreadyExistingFiles.length > 0) {
            warn("Destination file(s) already exist!")
            alreadyExistingFiles.forEach(path => warn("   ", path))
            return false
        }
        makeDirsIfNeeded(dstDirs)
        for (let fileIndex = 0; fileIndex < srcFiles.length; fileIndex++) {
            const src = Path.resolve(this.path, srcFiles[fileIndex] ?? "")
            const dst = dstFiles[fileIndex] as string
            const content = loadTextFile(src)
            if (!content) {
                warn("Unable to read this file:")
                warn("   ", src)
                return
            }
            saveTextFile(dst, apply(content, params))
        }
        return true
    }
}
