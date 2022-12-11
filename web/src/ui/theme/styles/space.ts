import { Circumference, convertCircumferenceIntoString } from "./crcumference"

export interface SpaceStyleProps {
    borderRadius?: Circumference
    margin?: Circumference
    padding?: Circumference
}

export function styleSpace({ borderRadius, margin, padding }: SpaceStyleProps) {
    const style: React.CSSProperties = {}
    if (borderRadius)
        style.borderRadius = convertCircumferenceIntoString(borderRadius)
    if (margin) style.margin = convertCircumferenceIntoString(margin)
    if (padding) style.padding = convertCircumferenceIntoString(padding)
    return style
}
