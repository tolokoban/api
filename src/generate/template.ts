import { CodeBlock, linearize } from "./../tools/linearize.js"

const RX_PLACEHOLDER = /^([ \t]*)\/\/\{\{([A-Z_]+)\}\}$/g

export function applyTemplate(
    template: string,
    placeholders: Record<string, CodeBlock>
): string {
    const lines = template.split("\n")
    const out: string[] = []
    for (const line of lines) {
        RX_PLACEHOLDER.lastIndex = -1
        const match = RX_PLACEHOLDER.exec(line)
        if (!match) {
            out.push(line)
            continue
        }
        const [_all, indent, name] = match
        const value = placeholders[name ?? ""]
        if (!value)
            throw Error(
                `This template needs a value for placeholder "${name}"!`
            )
        out.push(linearize(value, indent ?? ""))
    }
    return out.join("\n")
}
