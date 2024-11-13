const Teleport = {
    __isTeleport: true,
    process(n1, n2, container, internals) {
        const {patch, patchChildren, move} = internals
        if (!n1) {
            // 挂载到传入的to参数上
            const target = typeof n2.props.to === 'string' 
                ? document.querySelector(n2.props.to)
                : n2.props.to
            n2.children.forEach(child => patch(null, child, target()))
        } else {
            // 更新
            patchChildren(n1, n2, container)
            if (n2.props.to !== n1.props.to) {
                const newTarget = typeof n2.props.to === 'string'
                    ? document.querySelector(n2.props.to)
                    : n2.props.to
                n2.children.forEach(child => move(child, newTarget))
            }
        }
    }
}