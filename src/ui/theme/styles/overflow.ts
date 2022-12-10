import * as React from "react"

export type OverflowValues =
    /**
     * Content is not clipped and may be rendered outside the padding box.
     */
    | "visible"
    /**
     * Content is clipped if necessary to fit the padding box.
     * No scrollbars are provided, and no support for allowing
     * the user to scroll (such as by dragging or using a scroll
     * wheel) is allowed. The content can be scrolled
     * programmatically (for example, by setting the value of a
     * property such as scrollLeft or the scrollTo() method),
     * so the element is still a scroll container.
     */
    | "hidden"
    /**
     * Similar to hidden, the content is clipped to the element's
     * padding box. The difference between clip and hidden is that
     * the clip keyword also forbids all scrolling, including
     * programmatic scrolling. The box is not a scroll container,
     * and does not start a new formatting context.
     *
     * If you wish to start a new formatting context,
     * you can use display: flow-root to do so.
     */
    | "clip"
    /**
     * Content is clipped if necessary to fit the padding box.
     * Browsers always display scrollbars whether or not any
     * content is actually clipped, preventing scrollbars from
     * appearing or disappearing as content changes.
     * Printers may still print overflowing content.
     */
    | "scroll"
    /**
     * Depends on the user agent. If content fits inside the
     * padding box, it looks the same as visible,
     * but still establishes a new block formatting context.
     * Desktop browsers provide scrollbars if content overflows.
     */
    | "auto"

export interface OverflowStyleProps {
    overflow?:
        | OverflowValues
        | [overflowX: OverflowValues, overflowY: OverflowValues]
    overflowX?: OverflowValues
    overflowY?: OverflowValues
}

export function styleOverflow({
    overflow: overflow,
    overflowX: overflowX,
    overflowY: overflowY,
}: OverflowStyleProps): React.CSSProperties {
    const style: React.CSSProperties = {}
    if (overflow) {
        if (typeof overflow === "string") {
            style.overflow = overflow
            return style
        }
        const [x, y] = overflow
        style.overflowX = x
        style.overflowY = y
        return style
    }
    if (overflowX) style.overflowX = overflowX
    if (overflowY) style.overflowY = overflowY
    return style
}
