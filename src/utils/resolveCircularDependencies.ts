import { container } from "../main"

export const resolveCircularDependencies = () => {
    Object.entries(container.lazyInjectibles).forEach(([className, { classToInjectIn, property }]) => {
        const messages = [
            "Resolving Circular Dependency",
            `Found circular link between ${classToInjectIn} & ${className}.`,
            `Inside of constructor of ${classToInjectIn}, ${className} will be injected lazily.`,
            `Please do not access ${className} inside of constructor of ${classToInjectIn}.`
        ]
        console.warn(messages.join("\n"))
        // Get instance of classes to inject inside
        const injectable = container.instances[classToInjectIn];
    
        // Inject the instance into property in target class
        injectable[property] = container.instances[className];
    })
}
