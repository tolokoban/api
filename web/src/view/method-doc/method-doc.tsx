import { IEntrypoint, ITypeObject } from "@/types"
import Markdown from "markdown-to-jsx"
import React from "react"
import TypeDoc from "../type-doc"
import Style from "./method-doc.module.css"

interface IMethodDocProps {
    className?: string[]
    method?: IEntrypoint
}

export default class MethodDoc extends React.Component<IMethodDocProps, {}> {
    renderErrors(method: IEntrypoint) {
        console.info("method=", method)
        const errors = method.errors
        if (errors.length === 0) return null
        return (
            <>
                <div>
                    <h2>Params</h2>
                    <TypeDoc type={method.input} />
                </div>
                <div>
                    <h2>Result</h2>
                    <TypeDoc type={method.output} />
                </div>
                <div>
                    <h2>Error codes</h2>
                    <ul>
                        {errors.map(error => (
                            <li key={error.name}>
                                <span className="error-code-name thm-bgSL">
                                    {error.name}
                                </span>
                                <span> = </span>
                                <span className="error-code-number">
                                    {error.value}
                                </span>
                                <Markdown className="doc">
                                    {error.comment}
                                </Markdown>
                            </li>
                        ))}
                    </ul>
                </div>
                {Object.keys(method.dependencies).length > 0 && (
                    <div>
                        <h2>Dependencies</h2>
                        {Object.keys(method.dependencies).map(
                            (name: string) => {
                                const type = method.dependencies[name]
                                const parent =
                                    type.kind === "object" &&
                                    (type as ITypeObject).extends
                                return (
                                    <div
                                        className="thm-bg1 dependency"
                                        key={`dep-${name}`}
                                    >
                                        <header>
                                            <a id={name}>
                                                <h3>{name}</h3>
                                            </a>
                                            {parent && (
                                                <div>
                                                    <span> extends </span>
                                                    <a href={`#${parent}`}>
                                                        {parent}
                                                    </a>
                                                </div>
                                            )}
                                        </header>
                                        <TypeDoc type={type} />
                                    </div>
                                )
                            }
                        )}
                    </div>
                )}
            </>
        )
    }

    render() {
        const { method } = this.props
        if (!method) return null

        const classes = [Style.MethodDoc, ...(this.props.className ?? [])]

        return (
            <div className={classes.join(" ")}>
                <h1>{method.name}</h1>
                <Markdown>{method.comment}</Markdown>
                <div className="flex">{this.renderErrors(method)}</div>
            </div>
        )
    }
}
