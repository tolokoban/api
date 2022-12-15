export const CLIENT = `/**
 * This file has been generated automatically.
 * Please do not edit it manually.
 */

export type ClientErrors =
    | "_UNEXPECTED_ERROR_"
    | "_INVALID_PARAMS_"
    | "_INVALID_RESULT_"
    | "_NETWORK_ERROR_"
    | "_UNAUTHORIZED_"

export default class Client {
    public token = ""

    constructor(private readonly url: string = "") {}

    //{{METHODS}}

    private async post<Params, Result>(
        name: string,
        params: Params,
        isType: (data: unknown) => data is Result
    ): Promise<Result | ClientErrors | number> {
        const request: RequestInit = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Authorization: \`Bearer \${this.token}\`,
            },
            redirect: "follow",
            referrer: "no-referrer",
            body: JSON.stringify(params),
        }
        const response = await fetch(\`\${this.url}/\${name}\`, request)
        const data = await response.json()
        switch (response.status) {
            case 200:
                if (isType(data)) return data
                return "_INVALID_RESULT_"
            case 400:
                return "_INVALID_PARAMS_"
            case 401:
                return "_UNAUTHORIZED_"
            case 500:
                if (!data || typeof data !== "object") return -1
                if (typeof data.code !== "number") return -1
                return data.code
            default:
                console.error("Unexpected HTTP status:", response.status)
                return -1
        }
    }
}

//{{INPUT_TYPES}}

//{{OUTPUT_TYPES}}

//{{ERROR_TYPES}}

//{{TYPE_GUARDS}}

//{{ASSERTS}}
`
