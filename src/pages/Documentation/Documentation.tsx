import React from "react"
import Theme from "@/ui/theme"
import Style from "./Documentation.module.css"
import { useStateCurrentEntrypointName, useStateEntrypoints } from "@/state"
import MethodDoc from "../../view/method-doc"
import { IEntrypoint } from "@/types"
import Panel from "../../ui/view/Panel"
import { Link } from "react-router-dom"
import Button from "@/ui/view/Button"

const $ = Theme.classNames

export interface DocumentationProps {
    className?: string
}

export default function Documentation({ className }: DocumentationProps) {
    const [entrypoints] = useStateEntrypoints()
    const [entrypointName, setEntrypointName] = useStateCurrentEntrypointName()
    const entrypoint = entrypoints.find(item => item.name === entrypointName)
    const handleImport = () => {}
    return (
        <Panel className={$.join(className, Style.Documentation)}>
            <nav className={$.join(Style.list, $.colorPrimary(1))}>
                <Button onClick={handleImport}>Import protocol file</Button>
                <hr />
                {entrypoints.sort(sortEntrypoints).map(item => (
                    <button
                        key={item.name}
                        onClick={() => setEntrypointName(item.name)}
                        className={$.colorPrimary(4)}
                    >
                        {item.name}
                    </button>
                ))}
                <hr />
                <Link to="/Generate">
                    <button className={$.colorTertiary(5)}>
                        Generate Code...
                    </button>
                </Link>
            </nav>
            <div>{entrypoint && <MethodDoc method={entrypoint} />}</div>
        </Panel>
    )
}

function sortEntrypoints(a: IEntrypoint, b: IEntrypoint) {
    const A = a.name.toLowerCase()
    const B = b.name.toLowerCase()
    if (A < B) return -1
    if (A > B) return +1
    return 0
}
