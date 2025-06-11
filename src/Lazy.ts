import { container } from "./main";

const Lazy = (type: string, key?: string) => (target: Object, propertyKey: string, index?: number) => {
    if(!key && !propertyKey) throw new Error(`
        \nPlease correctly use Lazy decorator\n
        Either using it on property and pass type name\n
        i.e\n
        @Lazy("TypeName") property: TypeName\n
        or either use it in constructor like this\n
        constructor(@Lazy("TypeName", "property") property: Typename) {}
    `)
    container.lazyPeople[type] = { ...container.lazyPeople, classToInjectIn: key ? (target as any).name : target.constructor.name, property: propertyKey || key! }
}

export default Lazy
