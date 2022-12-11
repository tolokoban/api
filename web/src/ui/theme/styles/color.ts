import { ColorName } from "./types"

export interface ColorStyleProps {
    color?: ColorName
    textColor?: ColorName
    backColor?: ColorName
}

export function styleColor(
    { color, textColor, backColor }: ColorStyleProps,
    defaults: Partial<ColorStyleProps> = {}
): React.CSSProperties {
    const style: React.CSSProperties = {}
    if (!color && !textColor && !backColor) {
        color = defaults.color
        textColor = defaults.textColor
        backColor = defaults.backColor
    }
    if (color) {
        style.color = `var(--theme-color-on-${color})`
        style.backgroundColor = `var(--theme-color-${color})`
    }
    if (textColor) style.color = `var(--theme-color-${textColor})`
    if (backColor) style.backgroundColor = `var(--theme-color-${backColor})`
    return style
}
