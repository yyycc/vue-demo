const template = `
<div>
    <h1 v-if="ok">vue template</h1>
</div>
`

function compiler(template) {
    const ast = parse(template)
    transform(ast)
    return generate(ast.jsNode)
}

function parse(template) {
    return ''
}

function transform(templateAST) {
    return ''
}

function generate(jsAST) {
    return ''
}

const templateAST = parse(template)
const jsAST = transform(templateAST)
const code = generate(jsAST)

const ast = {
    type: 'Root',
    children: [
        {
            type: 'Element',
            tag: 'div',
            children: [
                {
                    type: 'Element',
                    tag: 'h1',
                    props: [
                        {
                            type: 'Direction',
                            name: 'if',
                            exp: {
                                type: 'Expression',
                                content: 'ok'
                            }
                        }
                    ],
                    children: 'vue template'
                }
            ]
        }
    ]
}