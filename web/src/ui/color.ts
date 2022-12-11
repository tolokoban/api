import lchPlugin from "colord/plugins/lch"
import { colord, Colord, extend } from "colord"
import { type } from "cypress/types/jquery"

extend([lchPlugin])

export default class Color {
    private color: Colord

    static isLight(color: string | Color): boolean {
        if (typeof color === "string") {
            return new Color(color).isLight()
        }

        return color.isLight()
    }

    /**
     *
     * @param red 0.0 to 1.1
     * @param green 0.0 to 1.1
     * @param blue 0.0 to 1.1
     * @param alpha 0.0 to 1.1
     * @returns
     */
    static fromRGB(red: number, green: number, blue: number, alpha = 1): Color {
        return new Color(
            colord({
                r: clamp(red) * 255,
                g: clamp(green) * 255,
                b: clamp(blue) * 255,
                a: alpha,
            }).toHex()
        )
    }

    /**
     *
     * @param lightness 0..100
     * @param chroma No upper bound, but 132 is already a maximum on most screens in 2022.
     * @param hue 0..360
     * @param alpha 0.0 to 1.0
     * @returns
     */
    static fromLCH(
        lightness: number,
        chroma: number,
        hue: number,
        alpha = 1
    ): Color {
        return new Color(
            colord({ l: lightness, c: chroma, h: hue, a: alpha }).toHex()
        )
    }

    static makeGradient(size: number, ...from: Array<string | Color>): Color[] {
        const colors: Color[] = []
        const factor = 1 / (size - 1)
        for (let i = 0; i < size; i++) {
            colors.push(Color.mix(i * factor, ...from))
        }
        return colors
    }

    /**
     *
     * @param from Colors
     * @param value From 0.0 to 1.0
     */
    static mix(value: number, ...from: Array<string | Color>): Color {
        const inputs = getColors(from)
        const steps = inputs.length - 1
        if (steps < 0) return new Color("#000")
        if (steps === 0) return inputs[0]

        const start = Math.min(Math.floor(value * steps), steps - 1)
        const A = inputs[start + 1]
        const B = inputs[start]
        const a = steps * (value - start / steps)
        const b = 1 - a
        const [lightnessA, chromaA, hueA] = A.lch
        const [lightnessB, chromaB, hueB] = B.lch
        const lightness = a * lightnessA + b * lightnessB
        const chroma = a * chromaA + b * chromaB
        let shiftA = 0
        let shiftB = 0
        if (Math.abs(hueA - hueB) > 180) {
            if (hueA < hueB) shiftA = 360
            else shiftB = 360
        }
        const hue = a * (hueA + shiftA) + b * (hueB + shiftB)
        const alpha = a * A.alpha + b * B.alpha
        return Color.fromLCH(lightness, chroma, hue, alpha)
    }

    constructor(public readonly cssValue: string) {
        this.color = colord(cssValue)
    }

    isLight(): boolean {
        return this.color.isLight()
    }

    get lch(): [lightness: number, chroma: number, hue: number] {
        const lch = this.color.toLch()
        return [lch.l, lch.c, lch.h]
    }

    get lcha(): [
        lightness: number,
        chroma: number,
        hue: number,
        alpha: number
    ] {
        const lch = this.color.toLch()
        return [lch.l, lch.c, lch.h, lch.a]
    }

    get hue() {
        return this.color.toLch().h
    }

    /**
     * @returns alpha value between 0.0 and 1.0
     */
    get alpha() {
        return this.color.alpha()
    }
}

function clamp(value: number): number {
    if (value < 0) return 0
    if (value > 1) return 1
    return value
}

function getColors(values: Array<Color | string>): Color[] {
    return values.map(v => (typeof v === "string" ? new Color(v) : v))
}
