import { RequestHandler } from "express"
import { container } from "./main"
import { MiddlewareScope } from "./enums/constants";

const Middlewares = (...handlers: RequestHandler[]) => <T extends ({new(...args:any[]): {}}), V extends Object>(constructor?: T | V, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if(!propertyKey && handlers?.length) {
        container.middlewares[(constructor as T).name] = container.middlewares[(constructor as T).name] || {};
        container.middlewares[(constructor as T).name][MiddlewareScope.CONTROLLER] = container.middlewares[(constructor as T).name]?.[MiddlewareScope.CONTROLLER] || { handlers: [] };
        container.middlewares[(constructor as T).name][MiddlewareScope.CONTROLLER].handlers.push(...handlers)
    }
    else if(propertyKey && descriptor) {
        const constructorName = (constructor as V).constructor.name;
        const handlerName = propertyKey;
        container.middlewares[constructorName] = container.middlewares[constructorName] || {};
        container.middlewares[constructorName][handlerName] = container.middlewares[constructorName]?.[handlerName] || { handlers: [] }
        container.middlewares[constructorName][handlerName].handlers.push(...handlers)
    }
}


export default Middlewares