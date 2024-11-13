function matches(pattern, name) {
    if (Array.isArray(pattern)) {
        return pattern.some((p) => matches(p, name))
    } else if (typeof pattern === 'string') {
        return pattern.split(',').includes(name)
    } else if (Object.prototype.toString.call(pattern) === '[object RegExp]') {
        return pattern.test(name)
    }
    return false
}
const KeepAlive = {
    __isKeepAlive: true,
    setup(props, slots) {
        const {include, exclude} = props
        const cache = new Map()
        const instance = currentInstance

        const {move, createElement} = instance.keepAliveCtx

        const storageContainer = createElement('div')

        instance._deActivated = (vnode) => {
            move(vnode, storageContainer)
        }

        instance._activated = (vnode, container, anchor) => {
            move(vnode, container, anchor)
        }

        return () => {
            let rawVNode = slots.default()
            if (typeof rawVNode.type !== 'object') {
                return rawVNode
            }
            const name = rawVNode.type.name
            if (
                (include && (!name || !matches(include, name))) ||
                (exclude && name && matches(exclude, name))
            ) {
                return rawVNode
            }
            const cacheVNode = cache.get(rawVNode.type)
            // 有cache说明已经挂载了
            if (cacheVNode) {
                rawVNode.component = cacheVNode.component // 直接继承缓存VNode的实例
                rawVNode.keptAlive = true
            } else {
                cache.set(rawVNode.type, rawVNode)
            }
            rawVNode.shouldKeepAlive = true
            rawVNode.keepAliveInstance = instance

            return rawVNode
        }
    }
}