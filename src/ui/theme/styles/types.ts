type ColorLevel = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
type ColorBase = "neutral" | "primary" | "secondary" | "tertiary"

export type ColorName =
    | `${ColorBase}-${ColorLevel}`
    | `${ColorBase}-${ColorLevel}-${ColorLevel}`
    | `on-${ColorBase}-${ColorLevel}`
    | `on-${ColorBase}-${ColorLevel}-${ColorLevel}`
    | "error"
    | "on-error"
