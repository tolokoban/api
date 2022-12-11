import React from "react"
import Theme from "@/ui/theme"
import Style from "./Scroll.module.css"
import { ColorName } from "../../theme/styles/types"

const $ = Theme.classNames

export interface ScrollProps {
    className?: string
    children: React.ReactNode
    color?: ColorName
    bannerSize?: string
}

export default function Scroll({
    className,
    children,
    color,
    bannerSize = "10rem",
}: ScrollProps) {
    const ref = React.useRef<HTMLDivElement | null>(null)
    React.useEffect(() => {
        const div = ref.current
        if (!div || !color) return

        div.style.setProperty("--banner-size", bannerSize)
        div.style.setProperty("--banner-color", `var(--theme-color-${color})`)
        div.style.color = `var(--theme-color-on-${color})`
        div.style.backgroundColor = `var(--theme-color-${color})`
    }, [ref.current, color])
    return (
        <div className={$.join(className, Style.Scroll)} ref={ref}>
            <div>{children}</div>
        </div>
    )
}
