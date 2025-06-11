
class BeanCurrentlyInCreationException extends Error {
    private static _message = `\nCan't inject an instance that is currently in creation.\n
    Consider using @Lazy in this case.\n
    Circular dependency is a design smell, a bad smell, just like yours.\n`
    constructor() {
        super(BeanCurrentlyInCreationException._message)
    }
}

export default BeanCurrentlyInCreationException