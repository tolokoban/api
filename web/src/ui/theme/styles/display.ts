import { provideGaps } from "./gap"

export type DisplayStyleProps =
    | {
          display?:
              | "none"
              | "block"
              | "inline"
              | "inline-block"
              | "flow-root"
              | "table"
              | "table-row"
              | "table-cell"
              | "table-caption"
              | "table-column"
      }
    | DisplayFlexStyleProps
    | DisplayGridStyleProps

interface DisplayFlexStyleProps {
    display: "flex" | "inline-flex"
    /* Default to `space-between` */
    justifyContent?:
        | "start"
        | "end"
        | "flex-start"
        | "flex-end"
        | "center"
        | "left"
        | "right"
        | "normal"
        | "baseline"
        | "first baseline"
        | "last baseline"
        | "space-between"
        | "space-around"
        | "space-evenly"
        | "stretch"
        | "safe"
        | "unsafe"
    /** Default to `center` */
    alignItems?:
        | "normal"
        | "flex-start"
        | "flex-end"
        | "center"
        | "start"
        | "end"
        | "self-start"
        | "self-end"
        | "baseline"
        | "first baseline"
        | "last baseline"
        | "stretch"
        | "safe"
        | "unsafe"
    gap?: string | [column: string, row: string]
    columnGap?: string
    rowGap?: string
    /** Default to `row` */
    flexDirection?: "row" | "column" | "row-reverse" | "column-reverse"
    /** Default to `nowrap` */
    flexWrap?: "wrap" | "nowrap" | "wrap-reverse"
}
interface DisplayGridStyleProps {
    display: "grid" | "inline-grid"
    gap?: string | [column: string, row: string]
    columnGap?: string
    rowGap?: string
    gridTemplateColumns?: string
    gridTemplateRows?: string
    justifyContent?:
        | "start"
        | "end"
        | "flex-start"
        | "flex-end"
        | "center"
        | "left"
        | "right"
        | "normal"
        | "baseline"
        | "first baseline"
        | "last baseline"
        | "space-between"
        | "space-around"
        | "space-evenly"
        | "stretch"
        | "safe"
        | "unsafe"
    /** Default to `center` */
    alignItems?:
        | "normal"
        | "flex-start"
        | "flex-end"
        | "center"
        | "start"
        | "end"
        | "self-start"
        | "self-end"
        | "baseline"
        | "first baseline"
        | "last baseline"
        | "stretch"
        | "safe"
        | "unsafe"
}

export function styleDisplay(props: DisplayStyleProps): React.CSSProperties {
    const { display } = props
    if (!display) return {}

    if (display === "flex" || display === "inline-flex")
        return styleDisplayFlex(props)
    if (display === "grid" || display === "inline-grid")
        return styleDisplayGrid(props)
    return { display }
}

function styleDisplayFlex({
    display,
    gap,
    rowGap,
    columnGap,
    justifyContent = "space-between",
    alignItems = "center",
    flexDirection = "row",
    flexWrap = "nowrap",
}: DisplayFlexStyleProps): React.CSSProperties {
    const style: React.CSSProperties = {
        display,
        ...styleGap({ gap, rowGap, columnGap }),
    }
    style.justifyContent = justifyContent
    style.alignItems = alignItems
    style.flexWrap = flexWrap
    style.flexDirection = flexDirection
    return style
}

function styleDisplayGrid({
    display,
    gap,
    rowGap,
    columnGap,
    gridTemplateRows,
    gridTemplateColumns,
    justifyContent = "center",
    alignItems = "center",
}: DisplayGridStyleProps): React.CSSProperties {
    const style: React.CSSProperties = {
        display,
        ...styleGap({ gap, rowGap, columnGap }),
    }
    style.gridTemplateRows = gridTemplateRows
    style.gridTemplateColumns = gridTemplateColumns
    style.justifyContent = justifyContent
    style.alignItems = alignItems
    return style
}

function styleGap({
    gap,
    columnGap,
    rowGap,
}: {
    gap?: string | [column: string, row: string]
    columnGap?: string
    rowGap?: string
}) {
    const style: React.CSSProperties = {}
    if (gap) style.gap = provideGaps(gap)
    if (columnGap) style.columnGap = columnGap
    if (rowGap) style.rowGap = rowGap
    return style
}
