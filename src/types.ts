import { RequestHandler, Router } from "express";
import { ParamDecorators } from "./enums/constants";
import { IncomingMessage, Server, ServerResponse } from "http";

export interface IClasses {
    [key: string]: Function;
}

export interface IControllers {
    [key: string]: {
        router: Router;
        route: string;
    }
}

export interface IServerInstance extends Server<typeof IncomingMessage, typeof ServerResponse> {}

export interface IMiddleware {
    [key: string]: {
        [scope: string]: {
            handlers: RequestHandler[];
        }
    }
}

export interface IPendingRegisteration {
   [key: string]: {
        route: string;
        handlerName: string;
        method: "get" | "post" | "delete" | "put" | "patch";
   }[];
}

export interface ILazyPeople {
    [key: string]: {
        classToInjectIn: string;
        property: string;
    }
}

export interface IRequestHandlerParams {
    [key: string]: {
        [key: string]: {
            [key: string]: {
                type: any;
                marker: ParamDecorators;
                [key: string]: any;
            }
        }
    }
}

export interface ValidationError {
    target: {new(...args:any[]):{}},
    value: string;
    property: string;
    children: any[],
    constraints: { [key: string]: string }
}

export interface IApp {
    port: number;
    controllers?: {new(...args:any[]):{}}[];
    middlewares?: any[];
    appRootPath?: string;
}

export interface MapOf<T> {
    [key: string]: T;
}