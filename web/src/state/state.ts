import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { IEntrypoint } from "../types"

const atomCurrentEntrypointName = atomWithStorage("current-entrypoint-name", "")
const atomEntrypoints = atomWithStorage<IEntrypoint[]>("entrypoints", [])

export function useStateCurrentEntrypointName(): [
    currentEntrypointName: string,
    setCurrentEntrypointName: (currentEntrypointName: string) => void
] {
    return useAtom(atomCurrentEntrypointName)
}

export function useStateEntrypoints(): [
    entrypoints: IEntrypoint[],
    setEntrypoints: (entrypoints: IEntrypoint[]) => void
] {
    return useAtom(atomEntrypoints)
}
