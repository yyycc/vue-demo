function render(domString, container) {
    container.innerHTML = domString
}

const content = 'ever'
const dom = document.getElementById('head')
render(`<div>${content}</div>`, dom)

function unmount(vnode) {
    if (vnode.type === 'object') {
        if (vnode.shouldKeepAlive) {
            vnode.keepAliveInstance._deActivated(vnode)
        } else {
            unmount(vnode.component.subTree)
        }
        return
    }
    const parent = vnode.el.parent
    if (parent) {
        const performRemove = () => parent.removeChild(vnode.el)
        if (vnode.transition) {
            vnode.transition.leave(vnode.el, performRemove)
        } else {
            performRemove()
        }
        
    }
}
function mountElement(vnode, container) {
    const el = vnode.el = createElement(vnode.type)
    if (vnode.transition) {
        vnode.transition.beforeEnter(vnode)
    }
    insert(el, container)
    if (vnode.transition) {
        vnode.transition.enter(vnode)
    }
}
function patch(n1, n2, container) {
    const { type } = n2
    if (typeof type === 'object' && type.__isTeleport) {
        type.process(
            n1, n2, container, {
                patch, 
                patchChildren, 
                move(vnode, container) {
                    insert(vnode.component ? vnode.component.subTree.el : vnode.el, container)
                }
            }
        )
    }
    if (typeof type ==='object' || typeof type === 'function') {
        if (!n1) {
            if (n2.keptAlive) {
                n2.keepAliveInstance._activated(vnode, container)
            } else {
                mountComponent(n2, container)
            }
        }
    }
}

function createRenderer() {
    function patch(n1, n2, container) {
        
    }
    function render(vnode, container) {
        if (vnode) {
            patch(container._vnode, vnode, container)
        } else {
            if (container._vnode) {
                // 卸载
                unmount(container._vnode)
            }
        }
        container._vnode = vnode
    }
    // 注水
    function hydrate() {}
}