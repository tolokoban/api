import React from "react"
import Theme from "@/ui/theme"
import Style from "./Documentation.module.css"
import { useStateCurrentEntrypointName, useStateEntrypoints } from "@/state"
import MethodDoc from "../../view/method-doc"
import { IEntrypoint } from "@/types"
import Panel from "../../ui/view/Panel"
import { Link } from "react-router-dom"
import Button from "@/ui/view/Button"
import InputFile from "@/ui/view/InputFile"
import { readFileAsText } from "../../tools/read-file-as-text"
import Parser from "../../parser/parser"

const $ = Theme.classNames

export interface DocumentationProps {
    className?: string
}

export default function Documentation({ className }: DocumentationProps) {
    const [entrypoints, setEntrypoints] = useStateEntrypoints()
    const [entrypointName, setEntrypointName] = useStateCurrentEntrypointName()
    const entrypoint = entrypoints.find(item => item.name === entrypointName)
    React.useEffect(() => {
        if (entrypoints.length > 0 && !entrypoint) {
            setEntrypointName(entrypoints[0].name)
        }
    }, [entrypoints, entrypoint])
    const handleImport = (files: FileList) => {
        console.log("🚀 [Documentation] files = ", files) // @FIXME: Remove this line written on 2022-12-10 at 20:07
        readFileAsText(files[0])
            .then(text => {
                try {
                    const parser = new Parser(text)
                    setEntrypoints(parser.parse())
                } catch (ex) {
                    console.error(ex)
                    alert(
                        "Please open the console to see the error in your file!"
                    )
                }
            })
            .catch(console.error)
    }
    return (
        <Panel className={$.join(className, Style.Documentation)}>
            <nav className={$.join(Style.list, $.colorPrimary(1))}>
                <InputFile
                    onClick={handleImport}
                    accept=".d.ts"
                    label="Import protocol file"
                />
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
