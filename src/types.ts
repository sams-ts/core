import { RequestHandler, Router } from "express";
import { ParamDecorators } from "./enums/constants";
import { IncomingMessage, Server, ServerResponse } from "http";

export interface IClasses {
    [key: string]: ({new(...args:any[]): {}});
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

export interface ILazyInjectables {
    [key: string]: {
        classToInjectIn: string;
        property: string;
    };
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

export interface IMetadataClassData {
    implements: string | null;
    constructorParams: Array<{ name: string, type: string, index: number }>
}

export interface IMetadata {
    interfaces: Record<string, string>;
    classes: {
        [key: string]: IMetadataClassData
    };
}
