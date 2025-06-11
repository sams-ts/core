import "reflect-metadata"
import { container } from "./main"
import BeanCurrentlyInCreationException from "./exceptions/BeanCurrentlyInCreationException";

const Autowired = (target: Object, propertyKey: string) => {
    var property = Reflect.getMetadata("design:type", target, propertyKey);
    if(!property) throw new BeanCurrentlyInCreationException();
    const instance = container.instances[property.name]
    target.constructor.prototype[propertyKey] = instance;
}

export default Autowired