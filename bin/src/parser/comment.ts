import Chalk from "chalk"

export interface Directives {
    /**
     * Protected by token?
     */
    secure: boolean
}

export function parseComment(comment: string): {
    comment: string
    directives: Directives
} {
    const directives: Directives = {
        secure: false,
    }
    const lines: string[] = []
    for (const line of splitComments(comment)) {
        if (!line.startsWith("@")) {
            lines.push(line)
            continue
        }
        if (line.startsWith("@secure")) {
            directives.secure = true
            continue
        }
        console.warn("Warning! Unknown directive:", Chalk.redBright(line))
        console.warn(
            Chalk.gray(
                splitComments(comment)
                    .map(item => `    // ${item}`)
                    .join("\n")
            )
        )
    }
    return { directives, comment: lines.join("\n") }
}

function splitComments(comments: string): string[] {
    const lines = comments.split("\n")
    const leftSpace = lines
        .map(countLeftSpaces)
        .reduce((acc, cur) => Math.max(acc, cur), 0)
    return lines.map(line => line.substring(leftSpace))
}

function countLeftSpaces(line: string): number {
    let count = 0
    for (const c of line) {
        if (c !== " ") return count

        count++
    }
    return 0
}
