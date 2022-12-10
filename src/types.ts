export interface IError {
    name: string
    value: number
    comment: string
}

export interface IEntrypoint {
    name: string
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

export interface IType {
    kind:
        | "object"
        | "array"
        | "union"
        | "string"
        | "number"
        | "boolean"
        | "alias"
        | "enum"
    comment: string
    attribs?: {
        [key: string]: {
            type: IType
            comment: string
        }
    }
    name?: string
    pos?: number
    line?: number
    subtype?: IType
    types?: IType[]
    value?: string | number
    enums?: IEnums
}

// This is the name of another interface.
export interface ITypeAlias extends IType {
    kind: "alias"
    name: string
    pos: number
    line: number
}

export interface ITypeEnum extends IType {
    kind: "enum"
    enums: IEnums
}

export interface ITypeObject extends IType {
    kind: "object"
    extends?: string
    parentType?: IType
    attribs: {
        [key: string]: {
            type: IType
            comment: string
            optional?: boolean
        }
    }
}

export interface ITypeUnion extends IType {
    kind: "union"
    types: IType[]
}

export interface ITypeArray extends IType {
    kind: "array"
    subtype: IType
}

export interface ITypeConstNumber extends IType {
    kind: "number"
    value: number
}

export interface ITypeConstString extends IType {
    kind: "string"
    value: string
}
