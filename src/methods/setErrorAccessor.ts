import { container } from "../main"

export const setErrorAccessor = (fn: (...args: any[]) => any) => {
    container.errorAccessor = fn;
}
