import { Router } from "express"
import { container } from "./main"
import Component from "./Component"
import { MiddlewareScope, ParamDecorators } from "./enums/constants";

const Controller = (route = "/") => <T extends {new(...args:any[]):{}}>(constructor: T) => {
    // Register constroller as a component
    Component(constructor);

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
                    // This is only for validating inputs against @Body, @Params & @Query decorators
                    for(const [key, value] of Object.entries(injectablePropsForMethod)) {
                        const { type, marker } = value
                        if([ParamDecorators.BODY, ParamDecorators.PARAMS, ParamDecorators.QUERY].includes(marker)) {
                            const inst = new type()
                            /**
                             * Presence of schema property signals it's a Yup Schema
                             */
                            if(inst?.schema) {
                                await inst.schema.validate?.(req[marker as keyof typeof req])
                            }
                            /**
                             * Otherwise I'd assume you are using class-validator
                             * Please make sure you set validation function i:e
                             * setValidator(validateOrReject)
                             */
                            if(!inst?.schema) {
                                Object.keys(req[marker as keyof typeof req] || {}).forEach(key => {
                                    inst[key] = req[marker as keyof typeof req][key]
                                })
                                await container.validate(inst)
                            }
                            methodParams[key as keyof {}] = req[marker as keyof typeof req]
                        }
                        else if(marker === ParamDecorators.REQ) methodParams[key as keyof {}] = req
                        else if(marker === ParamDecorators.RES) methodParams[key as keyof {}] = res
                    }
                }
                const data = await container.instances[constructor.name][handlerName]?.(...methodParams);
                if(data) res.status(200).send(data)
            } catch (error: any) {
                try {
                    /* If error accessor is available, we use it parse raised error and send response back */
                    const customError = container.errorAccessor?.(error)
                    if(customError) return res.status(400).send(customError)

                    /**
                     * Legacy code for error handling
                     * I am keeping it for the sake of people
                     * Those who want things to be simple and ready made
                     */
                    if(Array.isArray(error))
                        return res.status(400).send({ message: Object.values(error[0].constraints)[0] })
                    if(error?.errors?.length)
                        return res.status(400).send({ message: error?.errors?.[0] })
                    if(error?.details?.length)
                        return res.status(400).send({ message: error.details?.[0]?.message })

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