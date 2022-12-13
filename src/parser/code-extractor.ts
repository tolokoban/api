export default function(text: string, pos: number, line: number): string {
    const lines = text.split("\n")
    const minLine = Math.max(1, line - 5)
    const maxLine = Math.min(lines.length, line + 5)
    const output: string[] = []

    for (let k = minLine; k <= maxLine; k++) {
        output.push(`${pad(k)}: ${lines[k - 1]}`)
        if (k === line) {
            output.push(`${spc(pos + 6)}^`)
        }
    }

    return output.join("\n")
}


function spc(size: number) {
    let out = ''
    while (out.length < size) out += '_'
    return out
}

function pad(value: number) {
    let out = `${value.toFixed(0)}`
    while (out.length < 4) out = `0${out}`
    return out
}
