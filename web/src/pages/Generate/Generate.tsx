import React from "react"
import Theme from "@/ui/theme"
import Style from "./Generate.module.css"
import GenerateTsApi from "../../view/generate-ts-api/generate-ts-api"

const $ = Theme.classNames

export interface GenerateProps {
    className?: string
}

export default function Generate({ className }: GenerateProps) {
    return (
        <div className={$.join(className, Style.Generate)}>
            <GenerateTsApi />
        </div>
    )
}
