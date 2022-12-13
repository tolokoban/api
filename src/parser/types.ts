export interface IError {
    name: string
    value: number
    comment: string
}

export interface IEntrypoint {
    name: string
    secure: boolean
    comment: string
    errors: Array<IError>
    input: ITypeObject
    output: IType
    dependencies: { [key: string]: IType }
}

export interface IEnum {
    value: number
    comment: string
}

export interface IEnums {
    [key: string]: IEnum
}

export type IType =
    | ITypeAlias
    | ITypeArray
    | ITypeEnum
    | ITypeObject
    | ITypeRecord
    | ITypeUnion
    | ITypeBoolean
    | ITypeNumber
    | ITypeString

interface IBaseType {
    kind: string
    comment: string
    pos?: number
    line?: number
}

// interface IBaseType {
//     kind:
//         | "object"
//         | "array"
//         | "record"
//         | "union"
//         | "string"
//         | "number"
//         | "boolean"
//         | "alias"
//         | "enum"
//     comment: string
//     attribs?: {
//         [key: string]: {
//             type: IType
//             comment: string
//         }
//     }
//     name?: string
//     pos?: number
//     line?: number
//     subtype?: IType
//     types?: IType[]
//     value?: string | number
//     enums?: IEnums
// }

// This is the name of another interface.
export interface ITypeAlias extends IBaseType {
    kind: "alias"
    name: string
    pos: number
    line: number
}

export interface ITypeEnum extends IBaseType {
    kind: "enum"
    enums: IEnums
}

export interface IAttrib {
    type: IType
    comment: string
    optional?: boolean
}

export interface ITypeObject extends IBaseType {
    kind: "object"
    extends?: string
    parentType?: IType
    attribs: { [key: string]: IAttrib }
}

export interface ITypeUnion extends IBaseType {
    kind: "union"
    types: IType[]
}

export interface ITypeArray extends IBaseType {
    kind: "array"
    subtype: IType
}

export interface ITypeRecord extends IBaseType {
    kind: "record"
    subtype: IType
}

export interface ITypeNumber extends IBaseType {
    kind: "number"
    value?: number
}

export interface ITypeString extends IBaseType {
    kind: "string"
    value?: string
}

export interface ITypeBoolean extends IBaseType {
    kind: "boolean"
}
