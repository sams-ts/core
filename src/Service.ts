import Component from "./Component"

const Service = <T extends {new(...args: any[]):{}}>(constructor: T) => {
    /* Register service as a component */
    Component(constructor)
}

export default Service
