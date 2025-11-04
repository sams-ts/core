import { Router } from "express"
import { container } from "./main"
import Component from "./Component"
import { MiddlewareScope, ParamDecorators } from "./enums/constants";

const Controller = (route = "/") => <T extends {new(...args:any[]):{}}>(constructor: T) => {
    // Register constroller as a component
    Component()(constructor);

    // Add this controller to controller
    container.controllers[constructor.name] = { route, router: Router() }

    /**
     * Resgister all pending registration routes for controller if available
     * Check method parameters for each Request Method inside controller
     * Perform parameter injections as needed
     * Perform validations as needed
     * Add default error handling
     */
    if(!container.pendingRegisteration[constructor.name]?.length) return;
    
    container.pendingRegisteration[constructor.name].forEach(({ route, handlerName, method }) => {
        const middlewares = container.middlewares[constructor.name]?.[handlerName]?.handlers || []
        const injectablePropsForMethod = container.requestHandlerParams?.[constructor.name]?.[handlerName]
        container.controllers[constructor.name].router[method](route, ...middlewares, async(req, res, next) => {
            try {
                let methodParams = [req, res, next]
                if(injectablePropsForMethod) {
                    methodParams = []
                    for(const [key, value] of Object.entries(injectablePropsForMethod)) {
                        const { type, marker, ...rest } = value
                        if([ParamDecorators.BODY, ParamDecorators.PARAMS, ParamDecorators.QUERY].includes(marker)) {
                            await container.validate(req[marker], type, rest)
                            methodParams[key as keyof {}] = req[marker as keyof typeof req]
                        }
                        else if(marker === ParamDecorators.REQ) methodParams[key as keyof {}] = req
                        else if(marker === ParamDecorators.RES) methodParams[key as keyof {}] = res
                        else if(marker === ParamDecorators.NEXT) methodParams[key as keyof {}] = next
                    }
                }
                const data = await container.instances[constructor.name][handlerName]?.(...methodParams);
                if(data) res.status(200).send(data)
            } catch (error: any) {
                try {
                    /* If error accessor is available, we use it parse raised error and send response back */
                    const customError = container.errorAccessor?.(error)
                    if(customError) return res.status(400).send(customError)

                    /* Handling errors thrown by exceptions */
                    const { message, status } = JSON.parse(error.message)
                    res.status(status).send({ message })
                } catch (error) {
                    console.error(error)
                    res.status(500).send({ message: "Internal Server Error" })
                }
            }
        })
    })

    /**
     * Register this controller as an express route
     * Attach Controller Scoped middlewares
     * Attach controller router
     */
    if(container.app) {
        const middlewares = container.middlewares?.[constructor.name]?.[MiddlewareScope.CONTROLLER]?.handlers?.map?.((handlers) => handlers) || []
        container.app.use(route, ...middlewares, container.controllers[constructor.name]?.router)
    }
}

export default Controller