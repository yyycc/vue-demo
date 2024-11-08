const queue = new Set()
let isFlushing = false
const p = new Promise.resolve()
function queueJob(job) {
    queue.add(job)
    if (!isFlushing) {
        isFlushing = true
        p.then(() => {
            try {
                queue.forEach(job => job())
            } finally {
                isFlushing = false
                queue.length = 0
            }
        })
    }
}

function mountComponent(vnode, container) {
    const componentOptions = vnode.type
    const { data, props: propsOption, render, beforeMount, mounted, beforeUpdate, updated } = componentOptions
    const state = reactive(data())
    const [props, attrs] = resolveProps(propsOption, vnode.props)

    const instance = {
        state,
        props: shallowReactive(props),
        isMounted: false,
        subTree: null
    }

    vnode.component = instance
    const renderContent = new Proxy(instance, {
        get(target, key, receiver) {
            const {state, props} = target
            if (state && key in state) {
                return state[key]
            } else if (key in props) {
                return props[key]
            } else {
                console.error('不存在')
            }
        },
        set(target, key, newValue, receiver) {
            const {state, props} = target
            if (state && key in state) {
                state[key] = newValue
            } else if (key in props) {
                props[key] = newValue
            } else {
                console.error('不存在')
            }
        }
    })

    effect(() => {
        const subTree = render.call(renderContent, renderContent)
        if (!instance.isMounted) {
            beforeMount && beforeMount.call(renderContent)
            patch(null, subTree, container)
            instance.isMounted = true
            mounted && mounted.call(renderContent)
        } else {
            beforeUpdate && beforeUpdate.call(renderContent)
            patch(instance.subTree, subTree. container)
            updated && updated.call(renderContent)
        }
        instance.subTree = subTree
    }, {
        scheduler: queueJob
    })
}

function resolveProps(options, propsData) {
    const props = {}
    const attrs = {}
    for (const key in propsData) {
        if (key in options) {
            props[key] = propsData[key]
        } else {
            attrs[key] = propsData[key]
        }
    }
    return [props, attrs]
}

const MyComponent = {
    name: 'MyComponent',
    props: {
        title: String
    },
    data() {
        return {
            foo : 1
        }
    },
    render() {
        return {
            type: 'div',
            children: `foo的值为${this.foo}，title值为${this.title}`,
        }
    }
}
const CompVNode = {
    type: MyComponent,
    props: {
        title: 'I am title'
    }
}