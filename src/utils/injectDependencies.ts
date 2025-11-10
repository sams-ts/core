import { IMetadata } from "../types"
import { container } from "../main"

export const injectDependencies = (className: string, metadata: IMetadata, parentClass?: string) => {
    /* If instance already exists, then return */
    if(container.instances[className] !== undefined) return

    if(!container.classes[className]) {
        console.log(`${className} is not a Component`)
        return;
    }

    const { constructorParams } = metadata.classes[className]

    /* Instantiate if it has no constructor params and return */
    if(!constructorParams?.length) {
        const targetClass = container.classes[className]
        const targetInstance = new targetClass()
        container.instances[className] = targetInstance
        return
    }

    /**
     * Each constructor parameter has type interface or either class
     * Check and get the target constructor accordingly
     * Map it into array of constructors
     */
    const constructors = constructorParams.map(param => {
        /* Get target class constructor based upon type i:E Class / Interface */
        const targetClass = metadata.interfaces[param.type] ? container.classes[metadata.interfaces[param.type]] : container.classes[param.type]
        if(parentClass === targetClass.name) {
            /* Circular Dependency Detected. deferring injection */
            container.lazyInjectibles = { ...container.lazyInjectibles, [parentClass]: { classToInjectIn: className, property: param.name  } }
        }
        else {
            injectDependencies(targetClass.name, metadata, className)
        }
        return targetClass
    })

    /* Get instance of each dependency from container */
    const dependencies = constructors.map(constructor => container.instances[constructor.name])

    /* Get target class from container */
    const targetClass = container.classes[className]

    /* Create instance of target class with all its dependencies */
    const targetInstance = new targetClass(...dependencies)

    targetInstance?.[targetClass.name]?.(...dependencies)

    /* Set the instance into the container */
    container.instances[className] = targetInstance
}
