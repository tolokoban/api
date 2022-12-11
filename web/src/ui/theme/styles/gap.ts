export function provideGaps(params: string | string[]) {
    if (!Array.isArray(params)) params = [params]
    return params
        .map(text => {
            switch (text) {
                case "XS":
                case "S":
                case "M":
                case "L":
                case "XL":
                    return `var(--theme-gap-${text})`
                default:
                    return text
            }
        })
        .join(" ")
}
