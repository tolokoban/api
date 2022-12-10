import { input } from "./select.js"
import { TemplateParam } from "./template.js"

export function askParamsValues(
    params: Record<string, TemplateParam>
): Record<string, string> {
    const values: Record<string, string> = {}
    for (const name of Object.keys(params)) {
        const param = params[name]
        if (!param) continue

        values[name] = input(param?.label)
    }
    return values
}
