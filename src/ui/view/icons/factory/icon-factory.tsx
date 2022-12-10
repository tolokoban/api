import React from "react"
import GenericIcon, { GenericIconProps, Icon } from "../generic/generic-icon"

/**
 * We can found material icons here:
 * https://materialdesignicons.com/
 */
const iconsRenderers = new Map<string, Icon>()

export function makeIconView(value: string, name?: string): Icon {
    const rendererFromCache = iconsRenderers.get(value)
    if (rendererFromCache) return rendererFromCache

    const renderer: Icon = (props: Omit<GenericIconProps, "value">) => (
        <GenericIcon {...props} value={value} />
    )
    renderer.id = name ?? value
    iconsRenderers.set(value, renderer)
    return renderer
}
