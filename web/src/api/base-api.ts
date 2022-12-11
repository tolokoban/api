type IResolve = (output: any) => void
type IReject = (output: any) => void

export default class BaseApi {
    constructor(private hostname: string) { }

    call(method: string, params: any, resolve: IResolve, reject: IReject) {

    }
}
