import React from "react"
import Theme from "@/ui/theme"
import Style from "./Read.module.css"

const $ = Theme.classNames

export interface ReadProps {
    className?: string
    children: React.ReactNode
}

export default function Read({ className, children }: ReadProps) {
    return <div className={$.join(className, Style.Read)}>{children}</div>
}
