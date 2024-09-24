import { IEntrypoint } from "../../parser/types.js"
import { generateServerNode } from "./node.js"

export function generateServer(
    root: string | undefined,
    protocol: IEntrypoint[],
    scaffolder = false,
    serverType = "node"
) {
    switch (serverType) {
        case "node":
            return generateServerNode(root, protocol, scaffolder)
        default:
            throw Error(
                `Don't know how to create a sever of type "${serverType}"!`
            )
    }
}
