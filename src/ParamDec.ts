import { ParamDecorators } from "./enums/constants";
import { container } from "./main";

const ParamDec = (marker: ParamDecorators) => (target: Object, methodName: string, parameterIndex: number) => {
    const type: any = Reflect.getOwnMetadata("design:paramtypes", target, methodName)?.[parameterIndex]
    if(!type) return;

    if(!container.requestHandlerParams[target.constructor.name])
        container.requestHandlerParams[target.constructor.name] = { [methodName]: { [parameterIndex]: { type, marker } } }
    
    else if(!container.requestHandlerParams[target.constructor.name][methodName])
        container.requestHandlerParams[target.constructor.name] = {
            ...container.requestHandlerParams[target.constructor.name],
            [methodName]: { [parameterIndex]: { type, marker } } 
        }
    
    else {
        container.requestHandlerParams[target.constructor.name][methodName] = {
            ...container.requestHandlerParams[target.constructor.name][methodName],
            [parameterIndex]: { type, marker }
        }
    }    
}

export const Body = ParamDec(ParamDecorators.BODY)
export const Req = ParamDec(ParamDecorators.REQ)
export const Res = ParamDec(ParamDecorators.RES)
export const Query = ParamDec(ParamDecorators.QUERY)
export const Param = ParamDec(ParamDecorators.PARAMS)
export const Next = ParamDec(ParamDecorators.NEXT)
