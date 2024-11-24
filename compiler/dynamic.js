const PatchFlags = {
    TEXT: 1,
    CLASS: 2,
    STYLE: 3,
    // others
}

const dynamicChildrenStack = []
let currentDynamicChildren = null

function openBlock() {
    dynamicChildrenStack.push(currentDynamicChildren = [])
}

function closeBlock() {
    currentDynamicChildren = dynamicChildrenStack.pop()
}

function render1() {
    return createVNode('div', {id: foo}, [
        createVNode('p', {class: 'bar'}, 'text', PatchFlags.TEXT)
    ])
}

function render() {
    return (
        openBlock(), createBlock('div', {id: foo}, [
            createVNode('p', {class: 'bar'}, 'text', PatchFlags.TEXT)
        ])
    )
}

function createBlock(tag, props, children) {
    const block = createVNode(tag, props, children)
    block.dynamicChildren = currentDynamicChildren
    
    closeBlock()
    
    return block
}

function createVNode(tag, props, children, flags) {
    const key = props || props.key
    props && delete props.key
    const vnode = {
        tag,
        props,
        children,
        key,
        patchFlags: flags
    }
    
    if (typeof flags !== 'undefined' && currentDynamicChildren) {
        currentDynamicChildren.push(vnode)
    }
    
    return vnode
}

function patchBlockChildren(n1, n2) {
    for (let i = 0; i < n2.dynamicChildren.length; i++) {
        patchElement(n1.dynamicChildren[i], n2.dynamicChildren[i])
    }
}

function patchElement(n1, n2) {
    const el = n2.el = n1.el
    const oldProps = n1.props
    const newProps = n2.props
    
    if (n2.dynamicChildren) {
        patchBlockChildren(n1, n2)
    } else {
        patchChildren(n1, n2, el)
    }
    
    if (n2.patchFlags) {
        const {patchFlags} = n2
        if (patchFlags === 1) {
            
        } else if (patchFlags === 2) {
            
        }
    } else {
        
    }
}