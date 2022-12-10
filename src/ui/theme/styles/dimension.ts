export interface DimensionStyleProps {
    width?: string
    height?: string
    maxWidth?: string
    maxHeight?: string
    minWidth?: string
    minHeight?: string
}

export function styleDimension({
    width,
    height,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
}: DimensionStyleProps) {
    const style: React.CSSProperties = {
        width,
        height,
        maxWidth,
        maxHeight,
        minWidth,
        minHeight,
    }
    return style
}
