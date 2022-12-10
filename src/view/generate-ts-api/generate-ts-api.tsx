import { useStateEntrypoints } from "@/state"
import React from "react"
import "./generate-ts-api.css"
import Generator from "./generator"

interface GenerateTsApiProps {
    className?: string
}

export default function GenerateTsApi({ className }: GenerateTsApiProps) {
    const [entrypoints] = useStateEntrypoints()
    return (
        <div className={className}>
            <FileView
                name="api.ts"
                code={Generator.generateCodeForClass(entrypoints)}
            />
            <FileView
                name="types-api.ts"
                code={Generator.generateCodeForEntryPointTypes(entrypoints)}
            />
            <FileView
                name="types-api-more.ts"
                code={Generator.generateCodeForTypes(entrypoints)}
            />
            <FileView
                name="base-api.ts"
                code={Generator.generateCodeForBaseApi()}
            />
            <FileView
                name="id-factory.ts"
                code={Generator.generateCodeForIdFactory()}
            />
        </div>
    )
}

function FileView({ name, code }: { name: string; code: string }) {
    return (
        <details>
            <summary>{name}</summary>
            <pre>{code}</pre>
        </details>
    )
}

// await navigator.clipboard.writeText(code)
