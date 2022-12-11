import React from "react"
import Theme from "@/ui/theme"
import Style from "./Panel.module.css"
import {
    Circumference,
    convertCircumferenceIntoString,
} from "../../theme/styles/crcumference"
import { ColorStyleProps, styleColor } from "../../theme/styles/color"
import { SpaceStyleProps, styleSpace } from "../../theme/styles/space"
import { OverflowStyleProps, styleOverflow } from "../../theme/styles/overflow"
import { DisplayStyleProps, styleDisplay } from "../../theme/styles/display"
import {
    DimensionStyleProps,
    styleDimension,
} from "../../theme/styles/dimension"

const $ = Theme.classNames

export type PanelProps = {
    className?: string
    children: React.ReactNode
    borderRadius?: Circumference
    fontSize?: string
} & ColorStyleProps &
    SpaceStyleProps &
    DimensionStyleProps &
    OverflowStyleProps &
    DisplayStyleProps

function Panel(props: PanelProps) {
    const { className, children, borderRadius, fontSize } = props
    const style: React.CSSProperties = {
        fontSize,
        ...styleColor(props),
        ...styleSpace(props),
        ...styleDimension(props),
        ...styleOverflow(props),
        ...styleDisplay(props),
    }
    if (borderRadius)
        style.borderRadius = convertCircumferenceIntoString(borderRadius)
    return (
        <div className={$.join(className, Style.Panel)} style={style}>
            {children}
        </div>
    )
}

export function makeCustomPanel(
    defaultProps: Partial<PanelProps>
): (props: PanelProps) => JSX.Element {
    return (props: PanelProps) =>
        Panel({
            ...defaultProps,
            ...props,
        })
}

export default Panel
