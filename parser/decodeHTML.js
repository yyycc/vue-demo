const nameCharacterReferences = {
    "gt": ">",
    "gt;": ">",
    "lt": "<",
    "lt;": "<",
    "ltcc;": "⪦"
}

const prefixReg = /&(?:#x?)?/i
const ASCIIOrNumberReg = /[0-9a-z]/i
const sixteenthReg = /^&#x([0-9a-f]+);?/i
const tenthReg = /^&#x([0-9]+);?/i

function decodeHTML(rawText, asAttr = false) {
    let offset = 0
    const end = rawText.length
    let decodeText = ''
    let maxCRNameLength = 0
    function advance(length) {
        offset += length
        rawText = rawText.slice(length)
    }
    
    while (offset < end) {
        const head = prefixReg.exec(rawText)
        if (!head) {
            const remaining = end - offset
            decodeText += rawText.slice(0, remaining)
            advance(remaining)
            break
        }
        decodeText += rawText.slice(0, head.index) // &前的文本内容
        advance(head.index)
        
        // 命名字符引用
        if (head[0] === '&') {
            let name = ''
            let value = ''
            if (ASCIIOrNumberReg.test(rawText[1])) {
                if (!maxCRNameLength) {
                    maxCRNameLength = Object.keys(nameCharacterReferences).reduce(
                        (max, name) => Math.max(max, name.length),
                        0
                    )
                }
                for (let length = maxCRNameLength; !value && length > 0 ; length--) {
                    name = rawText.slice(1, length)
                    value = nameCharacterReferences[name]
                }
                if (value) {
                    const semi = name.endsWith(';')
                    if (asAttr && !semi && /[=a-z0-9]/i.test(rawText[name.length + 1] || '')) {
                        decodeText += '&' + name
                        advance(1 + name.length)
                    } else {
                        decodeText += value
                        advance(1 + name.length)
                    }
                } else {
                    decodeText += '&' + name
                    advance(1 + name.length)
                }
            } else {
                decodeText += '&'
                advance(1)
            }
        } else {
            // 数字字符引用
            const hex = head[0] === '&#x'
            const pattern = hex ? sixteenthReg : tenthReg
            const body = pattern.exec(rawText)
            if (body) {
                const cp = Number.parseInt(body[1], hex ? 16: 10)
                /* 合法性检查 */

                /* 合法性检查 */
                decodeText += String.fromCodePoint(cp)
                advance(body[0].length)
            } else {
                decodeText += head[0]
                advance(head[0].length)
            }
        }
    }
    
    return decodeText
}