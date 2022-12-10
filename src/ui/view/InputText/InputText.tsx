import React from "react"
import Theme from "@/ui/theme"
import Style from "./InputText.module.css"
import { SpaceStyleProps, styleSpace } from "../../theme/styles/space"

const $ = Theme.classNames

export type InputTextProps = {
    className?: string
    placeholder?: string
    value: string
    onChange(this: void, value: string): void
    type?: "text" | "email" | "password"
    maxWidth?: string
} & SpaceStyleProps

export default function InputText(props: InputTextProps) {
    const {
        className,
        placeholder,
        value,
        onChange,
        type = "text",
        maxWidth,
    } = props
    const id = React.useId()
    const [text, setText] = React.useState(value)
    React.useEffect(() => {
        onChange(text)
    }, [text])
    const style: React.CSSProperties = {
        ...styleSpace(props),
    }
    if (maxWidth) style.maxWidth = maxWidth
    return (
        <>
            <input
                className={$.join(className, Style.InputText)}
                style={style}
                placeholder={placeholder}
                type={type}
                value={text}
                onChange={evt => setText(evt.target.value)}
            />
        </>
    )
}
