import ComponentScan from "./ComponentScan"
import { container } from "./main"
import { IApp } from "./types"

const App = ({ port, middlewares, appRootPath }: IApp) => <T extends {new(...args:any[]):{}}>(constructor: T) => {
    /** Check app environment */
    const NODE_ENV = process.env.NODE_ENV?.trim()
    
    /** Set default directory based on environment if not specified */
    if(!appRootPath)
        appRootPath = NODE_ENV === "production" ? "dist" : "src"

    /** Run a component scan in directories */
    ComponentScan(appRootPath)

    /* Attach Middlewares from outside */
    middlewares?.forEach(middleware => container.app.use(middleware))
    
    /* Starting Express application on given port */
    const server = container.app.listen(port, () => console.log(`${constructor.name} started at ${port}`))

    /* Saving useful properties in container for later access */
    container.server = server
}

export default App