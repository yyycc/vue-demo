function dump(node, indent = 0) {
    const type = node.type
    const desc = node.type === 'Root'
        ? ''
        : node.type === 'Element'
            ? node.tag
            : node.content
    console.log(`${'-'.repeat(indent)}${type}: ${desc}`)
    if (node.children) {
        node.children.forEach(child => dump(child, indent + 2))
    }
}

function traverseNode(ast, context) {
    context.currentNode = ast
    const exitFns = []
    const transforms = context.nodeTransforms
    for (let i = 0; i < transforms.length; i++) {
        const onExit = transforms[i](context.currentNode, context)
        if (onExit) {
            exitFns.push(onExit)
        }
        if (!context.currentNode) return
    }
    const children = context.currentNode.children
    if (children) {
        for (let i = 0; i < children.length; i++) {
            context.parent = context.currentNode
            context.childIndex = i
            traverseNode(children[i], context)
        }
    }
    let i = exitFns.length
    while(i--) {
        exitFns[i]()
    }
}

/*辅助函数*/
function createStringLiteral(value) {
    return {
        type: 'StringLiteral',
        value
    }
}

function createIdentifier(name) {
    return {
        type: 'Identifier',
        name
    }
}

function createArrayExpression(elements) {
    return {
        type: 'ArrayExpression',
        elements
    }
}

function createCallExpression(name, arguments) {
    return {
        type: 'CallExpression',
        callee: createIdentifier(name),
        arguments
    }
}

/*辅助函数*/

function transformText(node) {
    if (node.type === 'Text') {
        const jsNode = createStringLiteral(node.content)
        node.jsNode = jsNode
    }
}

function transformElement(node) {
    return () => {
        if (node.type === 'Element') {
            const callExp = createCallExpression('h', [
                createStringLiteral(node.tag)
            ])
            if (node.children.length === 1) {
                callExp.arguments.push(node.children[0].jsNode)
            } else {
                callExp.arguments.push(createArrayExpression(node.children.map(child => child.jsNode)))
            }
            node.jsNode = callExp
        }
    }
}

function transformRoot(node) {
    return () => {
        if (node.type === 'Root') {
            const vnodeJSAST = node.children[0].jsNode
            node.jsNode = {
                type: 'FunctionDecl',
                id: createIdentifier('render'),
                params: [],
                body: [
                    {
                        type: 'ReturnStatement',
                        return: vnodeJSAST
                    }
                ]
            }
        }
    }
}

function transform(ast) {
    const context = {
        currentNode: null,
        childIndex: 0,
        parent: null,
        replaceNode(node) {
            if (context.parent?.children) {
                context.parent.children[context.childIndex] = node
                context.currentNode = node
            }
        },
        removeNode() {
            if (context.parent?.children) {
                context.parent.children.splice(context.childIndex, 1)
                context.currentNode = null
            }
        },
        nodeTransforms: [
            transformText,
            transformRoot,
            transformElement,
        ]
    }
    traverseNode(ast, context)
}

transform(templateAST)

