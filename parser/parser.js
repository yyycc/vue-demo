const TextModes = {
    DATA: 'DATA',
    RCDATA: 'RCDATA',
    RAWTEXT: 'RAWTEXT',
    CDATA: 'CDATA'
}

function decodeHTML(str) {
    return str
}

const attributeNameReg = /^[^\t\r\n\f />][^\t\r\n\f />=]*/
const attributeValueReg = /^[^\t\r\n\f >]+/

// id="foo" v-show="display"/>
function parseAttributes(context) {
    const {advancedBy, advanceSpaces} = context
    const props = []
    while (!context.source.startsWith('>') && !context.source.startsWith('/>')) {
        const match = attributeNameReg.exec(context.source)
        const name = match[0]
        advancedBy(name.length)
        advanceSpaces()
        advancedBy(1) // 消费=
        advanceSpaces()

        let value
        const quote = context.source[0]
        const ifQuoted = quote === "'" || quote === '"'
        if (ifQuoted) {
            advancedBy(1) // 消费引号
            const endQuoteIndex = context.source.indexOf(quote)
            if (endQuoteIndex > -1) {
                value = context.source.slice(0, endQuoteIndex)
                advancedBy(value.length)
                advancedBy(1) // 消费引号
            } else {
                console.error('缺号引号')
            }
        } else {
            const match = attributeValueReg.exec(context.source)
            value = match[0]
            advancedBy(value.length)
        }
        advanceSpaces()
        props.push({
            type: 'Attribute',
            name,
            value
        })
    }
    return props
}

const startTagReg = /^<([a-z][^\t\r\n\f />]*)/i
const endTagReg = /^<\/([a-z][^\t\r\n\f />]*)/i

function parseTag(context, type = 'start') {
    const {advancedBy, advanceSpaces} = context
    const match = type === 'start'
        ? startTagReg.exec(context.source)
        : endTagReg.exec(context.source)
    const tag = match[1]
    advancedBy(match[0].length)
    advanceSpaces()
    const props = parseAttributes(context)
    const isSelfClosing = context.source.startsWith('/>')
    advancedBy(isSelfClosing ? 2 : 1)
    return {
        type: 'Element',
        tag,
        props,
        children: [],
        isSelfClosing
    }
}

function parseElement(context, ancestors) {
    const element = parseTag(context)
    if (element.isSelfClosing) {
        return element
    }
    const {tag} = element
    if (tag === 'title' || tag === 'textArea') {
        context.mode = TextModes.RCDATA
    } else if (/style|noframes|iframes|xmp|noembed|noscript/.test(tag)) {
        context.mode = TextModes.RAWTEXT
    } else {
        context.mode = TextModes.DATA
    }
    ancestors.push(element)
    element.children = parseChildren(context, ancestors)
    ancestors.pop()
    if (context.source.startsWith('</')) {
        parseTag(context, 'end')
    } else {
        console.error(`${element.tag} 标签缺少闭合标签`)
    }
    return element
}

function parseInterpolation(context) {
    const {advancedBy} = context
    advancedBy("{{".length)
    const closeIndex = context.source.indexOf("}}")
    if (closeIndex < 0) {
        console.error("插值缺少结束界定符")
    }
    const content = context.source.slice(0, closeIndex)
    advancedBy(content.length)
    advancedBy("}}".length)
    return {
        type: 'Interpolation',
        content: {
            type: 'Expression',
            content: decodeHTML(content)
        }
    }
}

function parseCDATA(context) {

}

function parseComment(context) {
    const {advancedBy} = context
    advancedBy("<!--".length)
    const closeIndex = context.source.indexOf('-->')
    const content = context.source.slice(0, closeIndex)
    advancedBy(content.length)
    advancedBy('-->'.length)
    return {
        type: 'Comment',
        content,
    }

}

function parseText(context) {
    const {advancedBy} = context
    let endIndex = context.source.length
    let ltIndex = context.source.indexOf('<')
    const delimiterIndex = context.source.indexOf('{{')
    if (ltIndex > -1) {
        endIndex = Math.min(endIndex, ltIndex)
    }
    if (delimiterIndex > -1) {
        endIndex = Math.min(endIndex, delimiterIndex)
    }
    const content = context.source.slice(0, endIndex)
    advancedBy(content.length)
    return {
        type: 'Text',
        content
    }
}

function isEnd(context, ancestors) {
    if (!context.source) return true
    for (let i = 0; i < ancestors.length; i++) {
        if (context.source.startsWith(`</${ancestors[i].tag}>`)) {
            return true
        }
    }
}

function parseChildren(context, ancestors) {
    let nodes = []
    const {source, mode} = context
    while (!isEnd(context, ancestors)) {
        let node
        if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
            // 只有DATA模式支持标签解析
            if (mode === TextModes.DATA && source[0] === '<') {
                if (source[1] === '!') {
                    if (source.startsWith('<!--')) {
                        node = parseComment(context, ancestors)
                    } else if (source.startsWith('<![CDATA[')) {
                        node = parseCDATA(context, ancestors)
                    }
                } else if (source[1] === '/') {
                    // 抛出错误
                    console.error('无效的结束标签')
                } else if (/[a-z]/i.test(source[1])) {
                    node = parseElement(context, ancestors)
                }
            } else if (source.startsWith('{{')) {
                node = parseInterpolation(context, ancestors)
            }
        }
        if (!node) {
            node = parseText(context)
        }
        nodes.push(node)
    }
    return nodes
}

function parse(str) {
    const context = {
        source: str,
        mode: TextModes.DATA,
        advancedBy(num) {
            context.source = context.source.slice(num)
        },
        advanceSpaces() {
            const match = /^[\t\r\f\n ]+/.exec(context.source)
            if (match) {
                context.advancedBy(match[0].length)
            }
        }
    }
    const nodes = parseChildren(context, [])
    return {
        type: 'Root',
        children: nodes
    }
}