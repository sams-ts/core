import { ParamDecorators } from "./enums/constants"

import { container } from "./main"

const ParamDec = (marker: ParamDecorators, ...args: any[]) => (target: Object, methodName: string, parameterIndex: number) => {
    const type: any = Reflect.getOwnMetadata("design:paramtypes", target, methodName)?.[parameterIndex]
    if(!type) return;

    if(!container.requestHandlerParams[target.constructor.name])
        container.requestHandlerParams[target.constructor.name] = { [methodName]: { [parameterIndex]: { type, marker, ...(args || {}) } } }
    
    else if(!container.requestHandlerParams[target.constructor.name][methodName])
        container.requestHandlerParams[target.constructor.name] = {
            ...container.requestHandlerParams[target.constructor.name],
            [methodName]: { [parameterIndex]: { type, marker, ...(args || {}) } } 
        }
    
    else {
        container.requestHandlerParams[target.constructor.name][methodName] = {
            ...container.requestHandlerParams[target.constructor.name][methodName],
            [parameterIndex]: { type, marker, ...(args || {}) }
        }
    }    
}

export const Body = (...args: any[]) => ParamDec(ParamDecorators.BODY, ...args)
export const Query = (...args: any[]) => ParamDec(ParamDecorators.QUERY, ...args)
export const Param = (...args: any[]) => ParamDec(ParamDecorators.PARAMS, ...args)

export const Req = () => ParamDec(ParamDecorators.REQ)
export const Res = () => ParamDec(ParamDecorators.RES)
export const Next = () => ParamDec(ParamDecorators.NEXT)
