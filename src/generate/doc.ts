import { IEntrypoint } from "../parser/types.js"

export function generateDoc(path: string | undefined, protocol: IEntrypoint[]) {
    if (!path) return

    console.log("🚀 [doc] protocol = ", protocol) // @FIXME: Remove this line written on 2022-12-11 at 18:24
}
