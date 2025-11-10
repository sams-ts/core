import fs from "fs/promises"
import path from "path"

import { resolveCircularDependencies } from "./utils/resolveCircularDependencies"
import { injectDependencies } from "./utils/injectDependencies"

import { extractClassMetadata } from "./utils/extractClassMetadata"

import { IMetadata } from "./types"
import { container } from "./main"

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
			if (isPriority) priorityImports.push(modulePath)
			const secondaryCodeContents = ["@Controller(", "@Component", "@Service", ".Controller", ".Component", ".Service"]
			const isSecondary = secondaryCodeContents.some(secondaryCode => content.includes(secondaryCode))
			if (isSecondary) {
				if(file.name.endsWith(".ts")) {
					const METADATA = await extractClassMetadata(fullPath)
					container.metadata.interfaces = { ...container.metadata.interfaces, ...METADATA.interfaces }
					container.metadata.classes = { ...container.metadata.classes, ...METADATA.classes }
				}
				secondaryImports.push(modulePath)
			}
		}
	}
}

const ComponentScan = async(rootPath: string) => {
	const targetPath = path.join(process.cwd(), rootPath)
	const priorityImports: string[] = []
	const secondaryImports: string[] = []

	console.log(`👀 👀 👀 Scanning ${rootPath} 👀 👀 👀`)

	await scanAndImport(targetPath, priorityImports, secondaryImports)

	let isTypescriptBased = false

	if(priorityImports[0]?.endsWith(".ts") || secondaryImports[0]?.endsWith(".ts"))
		isTypescriptBased = true
	
	for (const module of priorityImports) {
		try {
			await import(module);
		} catch (error) {
			console.error(`Failed to import: ${module}`, error)
		}
	}

	for (const module of secondaryImports) {
		try {
			await import(module)
		} catch (error) {
			console.error(`Failed to import: ${module}`, error)
		}
	}

	if(isTypescriptBased)
		await fs.writeFile(`${process.cwd()}/${rootPath}/metadata.json`, JSON.stringify(container.metadata, null, 2))

	if(!isTypescriptBased)
		console.log("🔃 🔃 🔃 Reading Metadata 🔃 🔃 🔃")
	
	const metadata: IMetadata = isTypescriptBased ? container.metadata : JSON.parse(await fs.readFile(`${process.cwd()}/${rootPath}/metadata.json`, "utf-8"))
	
	console.log("💉 💉 💉 Injecting Dependencies 💉 💉 💉")

	Object.keys(metadata.classes).forEach(className => {
		injectDependencies(className, metadata)
	})

	resolveCircularDependencies()

	if(isTypescriptBased) delete container.metadata

	console.log("🚀 🚀 🚀 Server is Ready 🚀 🚀 🚀")
}

export default ComponentScan
