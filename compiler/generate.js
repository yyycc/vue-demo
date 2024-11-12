function generate(node) {
    const context = {
        code: '',
        push(code) {
            context.code += code
        },
        currentIndent: 0,
        newLine() {
            context.code += '\n' + `  `.repeat(context.currentIndent)
        },
        indent() {
            context.currentIndent++
            context.newLine()
        },
        deIndent() {
            context.currentIndent--
            context.newLine()
        }
    }
    genCode(node, context)
    return context.code
}

function genCode(node ,context) {
    switch (node.type) {
        case 'FunctionDecl':
            genFunctionDel(node, context)
            break
        case 'ReturnStatement':
            genReturnStatement(node, context)
            break
        case 'CallExpression':
            genCallExpression(node, context)
            break
        case 'StringLiteral':
            genStringLiteral(node, context)
            break
        case 'ArrayExpression':
            genArrayExpression(node, context)
            break
    }
}

function genNodeList(nodes, context) {
    const {push} = context
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        genCode(node, context)
        if (i < nodes.length - 1) {
            push(', ')
        }
    }
}

function genFunctionDel(node, context) {
    const {push, indent, deIndent} = context
    push(`function ${node.id.name} (`)
    genNodeList(node.params, context)
    push(') {')
    indent()
    node.body.forEach(n => genCode(n, context))
    deIndent()
    push('}')
}

function genReturnStatement(node, context) {
    const {push} = context
    push(`return `)
    genCode(node.return, context)
    
}

function genCallExpression(node, context) {
    const {push} = context
    push(`${node.callee.name}(`)
    genNodeList(node.arguments, context)
    push(')')

}

function genStringLiteral(node, context) {
    const {push} = context
    push(`'${node.value}'`)

}

function genArrayExpression(node, context) {
    const {push} = context
    push(`[`)
    genNodeList(node.elements, context)
    push(`]`)
}

generate(templateAST.jsNode)

