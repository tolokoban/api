import * as React from "react"
import { ColorStyleProps, styleColor } from "../../../theme/styles/color"
import Style from "./generic-icon.module.css"
import Theme from "@/ui/theme"

const $ = Theme.classNames

export type GenericIconProps = {
    className?: string
    type?: "filled" | "outlined" | "bold" | "dual"
    size?: string
    /** Starts the animation if `true` */
    animate?: boolean
    /** Description of the drawing. Ex.: `M8,20L12,10L16,20Z` */
    value: string
    onClick?(): void
} & ColorStyleProps

export type Icon = ((props: Omit<GenericIconProps, "value">) => JSX.Element) & {
    id: string
}

export default function GenericIcon(props: GenericIconProps) {
    const { value } = props
    const type = props.type ?? "filled"
    const style: React.CSSProperties = {
        ...styleColor(props),
        fontSize: props.size ?? "1.5em",
    }
    return (
        <svg
            className={getClassName(props)}
            style={style}
            viewBox="0 0 24 24"
            preserveAspectRatio="xMidYMid meet"
            onClick={props.onClick}
            tabIndex={props.onClick ? 1 : undefined}
            strokeWidth={1.5}
        >
            {type === "filled" && (
                <path d={value} fill="currentColor" stroke="none" />
            )}
            {type === "outlined" && (
                <path d={value} fill="none" stroke="currentColor" />
            )}
            {type === "bold" && (
                <path d={value} fill="currentColor" stroke="currentColor" />
            )}
            {type === "dual" && (
                <>
                    <path
                        d={value}
                        opacity={0.25}
                        fill="currentColor"
                        stroke="none"
                    />
                    <path d={value} fill="none" stroke="currentColor" />
                </>
            )}
        </svg>
    )
}

function getClassName(props: GenericIconProps): string {
    const classNames = [Style.GenericIcon]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }
    if (props.animate === true) classNames.push(Style.animate)
    if (props.onClick) classNames.push(Style.clickable)

    return classNames.join(" ")
}
