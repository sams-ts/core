import { container } from "./main";

const Route = (method: "get" | "post" | "delete" | "put" | "patch") => (route = "") => (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    // Add route with handler to pending registration list against constructor name
    if(!container.pendingRegisteration[target.constructor.name]) container.pendingRegisteration[target.constructor.name] = [];
    container.pendingRegisteration[target.constructor.name].push({
        route,
        handlerName: propertyKey,
        method
    });
}

export const GetMapping = Route("get");
export const PutMapping = Route("put");
export const PostMapping = Route("post");
export const DeleteMapping = Route("delete");
export const PatchMapping = Route("patch");
export const Get = Route("get");
export const Put = Route("put");
export const Post = Route("post");
export const Delete = Route("delete");
export const Patch = Route("patch");