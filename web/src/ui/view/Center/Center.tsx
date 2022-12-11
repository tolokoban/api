import React from "react"
import Theme from "@/ui/theme"
import Style from "./Center.module.css"

const $ = Theme.classNames

export interface CenterProps {
    className?: string
    children: React.ReactNode
}

export default function Center({ className, children }: CenterProps) {
    return <div className={$.join(className, Style.Center)}>{children}</div>
}
