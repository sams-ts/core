import { container } from "../main"

const setValidator = (validate: (...args:any[]) => any) => {
    container.validator = validate;
}

export default setValidator