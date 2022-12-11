export type CodeBlock = Array<string | CodeBlock>

export function linearize(block: CodeBlock, indent = ""): string {
    return `${block
        .map(item => {
            if (typeof item === "string") return item
            return linearize(item, `${indent}    `)
        })
        .join("\n")}\n`
}
