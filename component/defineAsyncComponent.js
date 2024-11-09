function defineAsyncComponent(options) {
    if (typeof options === 'function') {
        options = {
            loader: options
        }
    }
    const {
        loader,
        errorComponent,
        timeout,
        delay,
        loadingComponent,
    } = options
    let innerCompo = null
    
    return {
        name: 'AsyncComponentWrapper',
        setup() {
            const loaded = ref(false)
            const error = ref(null)
            const loading = ref(false)
            const placeholder = {type: 'div', children: ''}

            let delayTimer = null
            if (delay) {
                delayTimer = setTimeout(() => {
                    loading.value = true
                }, delay)
            } else {
                loading.value = true
            }

            loader().then(c => {
                loaded.value = true
                innerCompo = c
            })
                .catch((err) => error.value = err)
                .finally(() => {
                    loading.value = false
                    clearTimeout(delayTimer)
                })

            let timer = null
            if (timeout) {
                timer = setTimeout(() => {
                    error.value = new Error('超时')
                }, timeout)
            }

            onUmounted(() => clearTimeout(timer))

            return () => {
                return loaded.value
                    ? {type: innerCompo}
                    : (error.value && errorComponent)
                        ? {type: errorComponent, props: {error: error.value}}
                        : (loading.value && loadingComponent)
                            ? {type: loadingComponent}
                            : placeholder
            }
        }
    }
}

const AsyncComp = defineAsyncComponent({
    // 加载函数
    loader: () => import('./Foo.vue'),

    // 加载异步组件时使用的组件
    loadingComponent: LoadingComponent,
    // 展示加载组件前的延迟时间，默认为 200ms
    delay: 200,

    // 加载失败后展示的组件
    errorComponent: ErrorComponent,
    // 如果提供了一个 timeout 时间限制，并超时了
    // 也会显示这里配置的报错组件，默认值是：Infinity
    timeout: 3000
})