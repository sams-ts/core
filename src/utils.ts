import fs from "fs/promises"
import path from "path"

import * as ts from "typescript"

export const getPackagePath = (pkg: string) => {
    try {
        return require.resolve(pkg, { paths: [process.cwd()] })
    } catch {
        return ""
    }
}

export async function extractClassMetadata(filePath: string): Promise<Record<string, any>> {
    const code = await fs.readFile(filePath, 'utf8');

    // 1. Create a SourceFile node and the Program/Checker environment
    const sourceFile = ts.createSourceFile(
        path.basename(filePath),
        code,
        ts.ScriptTarget.ES2020,
        /* setParentNodes */ true
    );

    // This is required to resolve types accurately, although for simple
    // named types, we often rely on getText().
    const options: ts.CompilerOptions = {};
    const host = ts.createCompilerHost(options);
    const program = ts.createProgram([filePath], options, host);
    const checker = program.getTypeChecker();

    const metadata: Record<string, any> = {
        interfaces: {},
        classes: {}
    };

    /**
     * Helper to get the implementation interface name.
     */
    function getImplements(node: ts.ClassDeclaration): string[] | null {
        // Look through all heritage clauses (extends, implements)
        const implementsClause = node.heritageClauses?.find(
            clause => clause.token === ts.SyntaxKind.ImplementsKeyword
        );

        if (implementsClause && implementsClause.types.length > 0) {
            // We take all the interfaces implemented by class and convert them into string[]
            return implementsClause?.types?.map(type => type.expression.getText(sourceFile)) || []
        }

        return null;
    }

    /**
     * Helper to extract constructor parameters.
     */
    function getConstructorParams(node: ts.ClassDeclaration): Array<{ name: string, type: string }> {
        const constructorParams: Array<{ name: string, type: string, index: number, }> = [];

        // Find the constructor member
        const constructorNode = node.members.find(
            (member): member is ts.ConstructorDeclaration =>
                ts.isConstructorDeclaration(member)
        );

        if (constructorNode) {
            for (const [index, param] of constructorNode.parameters.entries()) {
                // Ensure the parameter has a type annotation
                if (param.type) {
                    // Extracting the parameter name
                    const paramName = param.name.getText(sourceFile);

                    // Extracting the type string (using getText() is simplest for basic names)
                    // For complex type resolution, you'd use the checker:
                    // const type = checker.getTypeFromTypeNode(param.type);
                    // const typeString = checker.typeToString(type);

                    // For this example, getText() is sufficient and less complex to set up.
                    const typeString = param.type.getText(sourceFile);

                    constructorParams.push({
                        name: paramName,
                        type: typeString,
                        index,
                    });
                }
            }
        }
        return constructorParams;
    }

    /**
     * AST Traversal Function
     */
    function visit(node: ts.Node) {
        if (ts.isClassDeclaration(node) && node.name) {
            const className = node.name.getText(sourceFile);

            const interfaces = getImplements(node)

            metadata.classes[className] = {
                implements: interfaces,
                constructorParams: getConstructorParams(node),
            }

            interfaces?.forEach(i => metadata.interfaces[i] = className)
        }

        ts.forEachChild(node, visit);
    }

    // Start traversal from the source file root
    visit(sourceFile);

    return metadata;
}
