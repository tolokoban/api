import Markdown from "markdown-to-jsx"
import React from "react"
import {
    IType,
    ITypeAlias,
    ITypeArray,
    ITypeEnum,
    ITypeObject,
} from "../../types"
import Style from "./type-doc.module.css"

interface ITypeDocProps {
    className?: string[]
    type: IType
}

export default function TypeDoc(props: ITypeDocProps) {
    const classes = [Style.TypeDoc, ...(props.className ?? [])]

    return <div className={classes.join(" ")}>{renderType(props.type)}</div>
}

function renderType(type: IType, inline = false) {
    switch (type.kind) {
        case "object":
            return renderTypeObject(type as ITypeObject)
        case "array":
            return renderTypeArray(type as ITypeArray)
        case "enum":
            return renderTypeEnum(type as ITypeEnum)
        case "string":
        case "number":
        case "boolean":
        case "alias":
            if (inline) {
                return getFirstSpan(type)
            }
            return <div className="code">{getFirstSpan(type)}</div>
        default:
            return (
                <pre className="error">{JSON.stringify(type, null, "  ")}</pre>
            )
    }
}

function renderTypeObject(type: ITypeObject) {
    const comment = type.comment
    return (
        <div className="type-object">
            {comment && comment.trim().length > 0 && (
                <Markdown className="doc">{type.comment}</Markdown>
            )}
            <pre>{`{`}</pre>
            <div className="indent">{renderTypeObjectAttribs(type)}</div>
            <pre>{`}`}</pre>
        </div>
    )
}

function renderTypeArray(type: ITypeArray) {
    const comment = type.comment
    return (
        <div className="type-array">
            {comment && comment.trim().length > 0 && (
                <Markdown className="doc">{type.comment}</Markdown>
            )}
            <div className="code type-array">{`Array<`}</div>
            <div className="indent">{renderType(type.subtype)}</div>
            <div className="code type-array">{`>`}</div>
        </div>
    )
}

function renderTypeEnum(type: ITypeEnum) {
    const comment = type.comment
    return (
        <div className="type-enum">
            {comment && comment.trim().length > 0 && (
                <Markdown className="doc">{type.comment}</Markdown>
            )}
            <ul>
                {Object.keys(type.enums).map(enumName => {
                    const item = type.enums[enumName]
                    return (
                        <li key={`enum.${enumName}`}>
                            <span className="error-code-name thm-bgSL">
                                {enumName}
                            </span>
                            <span> = </span>
                            <span className="error-code-number">
                                {item.value}
                            </span>
                            <span>&nbsp;&nbsp;</span>
                            <Markdown className="doc">{item.comment}</Markdown>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

function renderTypeObjectAttribs(type: ITypeObject) {
    const cells: Array<JSX.Element> = []
    const maskedAttribNames: string[] = Object.keys(type.attribs)
    let currentType = type
    while (currentType.parentType) {
        const parentType = currentType.parentType as ITypeObject
        console.info("currentType, parentType=", currentType, parentType)
        cells.unshift(
            <div>
                <div className="from">
                    <span>Inherited from &nbsp;</span>
                    <a href={`#${currentType.extends}`}>
                        {currentType.extends}
                    </a>
                </div>
                <div
                    className="inherited"
                    key={`inherited-${currentType.extends}`}
                >
                    <div>
                        {Object.keys(parentType.attribs)
                            .filter(
                                key => maskedAttribNames.indexOf(key) === -1
                            )
                            .map((attKey: string, attIdx: number) =>
                                renderTypeObjectAttrib(
                                    attKey,
                                    parentType.attribs[attKey].type,
                                    parentType.attribs[attKey].comment,
                                    parentType.attribs[attKey].optional === true
                                        ? true
                                        : false,
                                    attIdx
                                )
                            )}
                    </div>
                </div>
            </div>
        )
        maskedAttribNames.push(...Object.keys(parentType.attribs))
        currentType = parentType
    }
    Object.keys(type.attribs).forEach((attKey: string, attIdx: number) =>
        cells.push(
            renderTypeObjectAttrib(
                attKey,
                type.attribs[attKey].type,
                type.attribs[attKey].comment,
                type.attribs[attKey].optional === true ? true : false,
                attIdx
            )
        )
    )
    return cells
}

function renderTypeObjectAttrib(
    attKey: string,
    attVal: IType,
    attCom: string,
    attOpt: boolean,
    attIdx: number
) {
    const subType = attVal.subtype
    const inline = subType ? isSimpleType(subType) : false
    return (
        <div
            className="object-attrib"
            key={`object-attrib-${attKey}-${attIdx}`}
        >
            {attCom && attCom.trim().length > 0 && (
                <Markdown className="doc">{attCom}</Markdown>
            )}
            <div className="code">
                {attOpt && <span className="optional thm-bgPL">Optional</span>}
                <span className="att-key">{attKey}</span>
                <span>: </span>
                {getFirstSpan(attVal)}
                {attVal.kind === "array" && !inline && (
                    <div className="indent">
                        {renderType((attVal as ITypeArray).subtype)}
                    </div>
                )}
                {attVal.kind === "array" && !inline && (
                    <div className="code type-array">{">"}</div>
                )}
            </div>
        </div>
    )
}

function getFirstSpan(type: IType): JSX.Element {
    switch (type.kind) {
        case "object":
            return <span>{"{"}</span>
        case "alias":
            const alias = type as ITypeAlias
            return <a href={`#${alias.name}`}>{alias.name}</a>
        case "array":
            const subType = type.subtype as IType
            if (isSimpleType(subType)) {
                return (
                    <span>
                        <span className="type-array">{"Array<"}</span>
                        {renderType(subType, true)}
                        <span className="type-array">{">"}</span>
                    </span>
                )
            }
            return <span className="type-array">@@@{"Array<"}</span>
        case "boolean":
            return <span className="type-boolean">boolean</span>
        case "number":
            return typeof type.value === "number" ? (
                <span className="type-number">
                    {JSON.stringify(type.value)}
                </span>
            ) : (
                <span className="type-number">number</span>
            )
        case "string":
            return typeof type.value === "string" ? (
                <span className="type-string">
                    {JSON.stringify(type.value)}
                </span>
            ) : (
                <span className="type-string">string</span>
            )
        default:
            return <span>{type.kind}?</span>
    }
}

function getPadding(indent: number) {
    return { paddingLeft: `${indent * 0.5}rem` }
}

function getMargin(indent: number) {
    return { marginLeft: `${indent * 0.5}rem` }
}

function isSimpleType(type: IType): boolean {
    switch (type.kind) {
        case "alias":
        case "boolean":
        case "number":
        case "object":
        case "string":
            return true
        default:
            return false
    }
}
