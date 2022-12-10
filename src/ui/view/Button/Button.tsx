import React from "react"
import Theme from "@/ui/theme"
import Style from "./Button.module.css"
import { Circumference } from "../../theme/styles/crcumference"
import { ColorStyleProps, styleColor } from "../../theme/styles/color"
import { SpaceStyleProps, styleSpace } from "../../theme/styles/space"
import { DisplayStyleProps, styleDisplay } from "../../theme/styles/display"
import {
    DimensionStyleProps,
    styleDimension,
} from "../../theme/styles/dimension"

const $ = Theme.classNames

export type ButtonProps = {
    className?: string
    children: React.ReactNode
    onClick(this: void): void
    enabled?: boolean
    borderRadius?: Circumference
} & ColorStyleProps &
    SpaceStyleProps &
    DimensionStyleProps &
    DisplayStyleProps

function Button(props: ButtonProps) {
    const { className, children, onClick, enabled = true } = props
    const style: React.CSSProperties = {
        ...styleColor(props, {
            color: "secondary-5",
        }),
        ...styleDimension({
            height: "2em",
            ...props,
        }),
        ...styleSpace({
            margin: ["S", "M"],
            padding: [0, "M"],
            ...props,
        }),
        ...styleDisplay(
            props.display
                ? props
                : {
                      display: "flex",
                      justifyContent: "space-around",
                  }
        ),
    }
    if (!props.color && !props.backColor) {
        style.boxShadow = "none"
    }
    return (
        <button
            style={style}
            className={$.join(className, Style.Button)}
            disabled={!enabled}
            type="button"
            onClick={onClick}
        >
            {children}
        </button>
    )
}

export function makeCustomButton(
    defaultProps: Partial<ButtonProps>
): (props: ButtonProps) => JSX.Element {
    return (props: ButtonProps) =>
        Button({
            ...defaultProps,
            ...props,
        })
}

export default Button
