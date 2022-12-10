export function clamp(value: number, min = 0, max = 1): number {
    if (value < min) return min
    if (value > max) return max
    return value
}
