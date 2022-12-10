import { provideGaps } from "./gap"
export type Circumference =
    | string
    | number
    | [vertical: string | number, horizontal: string | number]
    | [
          top: string | number,
          right: string | number,
          bottom: string | number,
          left: string | number
      ]

/**
 * Attributes like `margin`, `padding`, box-radius`, etc. accept values of type Circumference.
 * It can be a single number, an array of two number or an array of four numbers.
 * It is also possible to use a string that will be used verbatim.
 *
 * Examples:
 *
 * ```ts
 * convertCircumferenceIntoString("27") === "27"
 * convertCircumferenceIntoString(27) === "27em"
 * convertCircumferenceIntoString(27, "px") === "27px"
 * convertCircumferenceIntoString([16, 32], "px") === "16px 32px"
 * ```
 */
export function convertCircumferenceIntoString(
    circumference: Circumference,
    unit = "em"
): string {
    if (typeof circumference === "string") return provideGaps(circumference)
    if (typeof circumference === "number") return `${circumference}${unit}`
    return circumference
        .map(value => convertCircumferenceIntoString(value, unit))
        .join(" ")
}
