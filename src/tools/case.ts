const SEP = /[^a-z0-9$]/gi

export function capitalizedCamelCase(name: string): string {
    return name.split(SEP).map(capitalize).join("")
}

export function capitalize(name: string) {
    return `${name.charAt(0).toUpperCase()}${name.substring(1)}`
}

export function uncapitalize(name: string) {
    return `${name.charAt(0).toLowerCase()}${name.substring(1)}`
}
