import "reflect-metadata"
import express, { Express } from "express"
import { IClasses, IControllers, ILazyPeople, IMiddleware, IPendingRegisteration, IRequestHandlerParams, IServerInstance } from "./types"
import { samsValidator } from "./methods/samsValidator"

class Container {
    public classes: IClasses = {}
    public instances: any = {}
    public controllers: IControllers = {}
    public middlewares: IMiddleware = {}
    public pendingRegisteration: IPendingRegisteration = {}
    public lazyPeople: ILazyPeople = {}
    public requestHandlerParams: IRequestHandlerParams = {}
    private _validate: (...args: any[]) => Promise<any> = async() => {}
    private _app: Express
    private _server: IServerInstance
    private _errorAccessor: (...args: any[]) => any | undefined;

    constructor() {
        this._app = express()
        this._validate = samsValidator
    }

    public set errorAccessor(errorExtractor: (...args: any[]) => any) {
        this._errorAccessor = errorExtractor
    }

    public get errorAccessor() {
        return this._errorAccessor
    }

    public get app() {
        return this._app
    }

    public set app(app: Express) {
        this._app = app
    }

    public get server() {
        return this._server
    }

    public set server(server: IServerInstance) {
        this._server = server
    }

    public get validate() {
        return this._validate
    }

    public set validator(validate: (...args: any[]) => any) {
        this._validate = validate
    }

    public set<T extends {new(...args:any[]):{}}>(constructor: T, instance: Object) {
        if((!this.classes[constructor.name] && !this.instances[constructor.name]) || !(instance instanceof constructor)) {
            this.classes[constructor.name] = constructor
            this.instances[constructor.name] = instance
        }
    }

    public get<T>(classType: { new (): T }): T {
        return this.instances[classType?.name]
    }
}

export const container = new Container()