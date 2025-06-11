import path from "path"
import fs from "fs/promises"

async function scanAndImport(dirPath: string, priorityImports: string[], secondaryImports: string[]): Promise<void> {
    const files = await fs.readdir(dirPath, { withFileTypes: true })
  
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name)
  
      if (file.isDirectory())
        await scanAndImport(fullPath, priorityImports, secondaryImports)

      else if (file.isFile() && /\.(ts|js)$/.test(file.name)) {
        const modulePath = path.resolve(fullPath)
        const content = await fs.readFile(modulePath, "utf-8")
        const priorityCodeContents = ["container.set", "setValidator", "setErrorAccessor"]
        const isPriority = priorityCodeContents.some(priorityCode => content.includes(priorityCode))
        if(isPriority) priorityImports.push(modulePath)
        const secondaryCodeContents = ["@Controller(", "@Component", "@Service", ".Controller", ".Component", ".Service"]
        const isSecondary = secondaryCodeContents.some(secondaryCode => content.includes(secondaryCode))
        if(isSecondary) secondaryImports.push(modulePath)
      }
    }
  }

const ComponentScan = (rootPath: string) => <T extends {new(...args: any[]):{}}>(constructor: T) => {
    const targetPath = path.join(process.cwd(), rootPath)
    const priorityImports: string[] = []
    const secondaryImports: string[] = []
    scanAndImport(targetPath, priorityImports, secondaryImports)
      .then(async() => {
        for(const module of priorityImports) {
          try {
            await import(module);
            console.log(`Imported: ${module}`)
          } catch (error) {
            console.error(`Failed to import: ${module}`, error)
          }
        }

        for(const module of secondaryImports) {
          try {
            await import(module)
            console.log(`Imported: ${module}`)
          } catch (error) {
            console.error(`Failed to import: ${module}`, error)
          }
        }
      })

}

export default ComponentScan
