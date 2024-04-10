### 官网对 vue 的介绍是：一套用于构建用户界面的渐进式框架。

### 构建用户界面

通过 `数据劫持` 和 `模板编译` 实现 ViewModel 与 Model 、 View 层双向绑定，达到数据驱动视图的效果。
MVVM 模型本质上是解决了命令式编程操作 Dom 所带来的程序规模庞大复杂后，代码缺乏组织变得难以维护的问题。虽然 vue 没有完全遵循 MVVM 模型,但也是从中受到了启发。

引入 `vdom` 加速了视图更新的速度。

在规范上 通过 Vue 构造器 、 optionApi 、与 html 写法相近的模板 实现开发时的功能实现。

### 渐进式

作为一个框架，除了自提供的语法外，或多或少都存在一些约束。而使用 vue 时候，既可以选择使用全家桶也可以与仅在部分功能与模块中使用，达到低侵入式。

vue 最核心的部分是视图渲染，然后往上是组件化的机制。在此基础上加上了路由、状态管理、构建工具和多平台。

<!-- <img :src="$withBase('/images/state.png')" alt="dock"> -->

### 源码流程跟踪

#### 项目架构

```
  examples          //功能示例
  flow              //静态类型检查
  src
  ├──compiler       //编译器
  ├──core
    ├──components   //keepalive
    ├──global-api   //全局api
    ├──instance     //vm实例相关核心功能实现
    ├──observer     //数据监听相关核心功能实现
    ├──util         //工具辅助函数
    ├──vdom         //vdom相关核心功能实现
  ├──platforms      //web、weex 平台相关功能
  ├──server         //webpack、nodejs等服务端环境相关功能
  ├──sfc            //单文件编译
  ├──shared         //常量、工具类等定义
  ├──test           //单元测试
  ├──types          //typescript支持
```

#### Vue 的构造器定义

`src/core/instance/index.js`

```js
function Vue(options) {
  if (process.env.NODE_ENV !== 'production' && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword');
  }
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);
```

此处 Vue 提供一个构造函数，对其进行是否有通过 `new` 构造实例进行校验和警告，然后调用原型上的`init`函数。
之后是对 Vue 构造器的原型上挂载各种属性与方法。

#### initMixin

`src/core/instance/init.js`

```js
let uid = 0;

export function initMixin(Vue: Class<Component>) {
  Vue.prototype._init = function(options?: Object) {
    //①
    const vm: Component = this;
    // a uid
    vm._uid = uid++; //②

    let startTag, endTag;
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance                      && mark) {
      startTag = `vue-perf-start:${vm._uid}`;
      endTag = `vue-perf-end:${vm._uid}`;
      mark(startTag);
    }

    // a flag to avoid this being observed
    vm._isVue = true; //③
    // merge options
    if (options && options._isComponent) {
      //④
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );
    } //⑤
    /* istanbul ignore else */ if (process.env.NODE_ENV !== 'production') {
      initProxy(vm);
    } else {
      vm._renderProxy = vm;
    }
    // expose real self
    vm._self = vm; //⑥
    initLifecycle(vm); //⑦
    initEvents(vm); //⑧
    initRender(vm); //⑨
    callHook(vm, 'beforeCreate'); //⑩
    initInjections(vm); // resolve injections before data/props      //⑪
    initState(vm); //⑫
    initProvide(vm); // resolve provide after data/props             //⑪
    callHook(vm, 'created'); //⑩

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false);
      mark(endTag);
      measure(`vue ${vm._name} init`, startTag, endTag);
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el); //⑬
    }
  };
}
```

1. 挂载`init`函数
2. 对每个 vm 标记 `id`
3. 标记 `_isVue` 避免监听该对象
4. 区分根实例和组件，若为组件则初始化组件的父子数据通信、组件标签、组件渲染函数(备注为动态合并 option 性能消耗，标记属性对其计算优化)，若为根实例则合并 option ，传递给 vm 的`$option`。该部分涉及组件化实现，此处先略过具体内部操作。
5. 测试环境中如果支持 es6 的`Proxy`则增加代理处理异常提示，不支持`Proxy`或正式环境中直接将 vm 赋值给 `_renderProxy`
6. 将当前实例赋值给 `_self`
7. 组件关联数据数据绑定、初始化实例部分属性与生命周期相关的标记，完整的 `Component`数据模型可看 `flow/component.js`

```js
export function initLifecycle(vm: Component) {
  const options = vm.$options;

  // locate first non-abstract parent
  let parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  vm.$children = [];
  vm.$refs = {};

  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}
```

| 名称               | 说明                                               |
| ------------------ | -------------------------------------------------- |
| \$parent           | 当前组件的父组件                                   |
| \$root             | 根组件                                             |
| \$children         | 子组件                                             |
| \$refs             | 引用对象的集合                                     |
| \_watcher          | watcher 实例                                       |
| \_inactive         | keep-alive 的激活状态                              |
| \_directInactive   | keep-alive 灭活状态标记                            |
| \_isMounted        | 生命周期-已挂载标记                                |
| \_isDestroyed      | 生命周期-已销毁标记                                |
| \_isBeingDestroyed | 介于 deforeDestroy 和 destroyed 之间的生命周期标记 |

8. 将父子组件间事件初始化，此处暂且略过具体实现
9. 初始化 vnode 相关的标记，接收父组件数据，挂载 `_c` 和 `$createElement` 分别处理模板和自定义 render

```js
export function initRender(vm: Component) {
  vm._vnode = null; // the root of the child tree
  vm._staticTrees = null; // v-once cached trees
  const options = vm.$options;
  const parentVnode = (vm.$vnode = options._parentVnode); // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(options._renderChildren, renderContext);
  vm.$scopedSlots = emptyObject;
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false);
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true);

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  const parentData = parentVnode && parentVnode.data;

  /* istanbul ignore else */
  if (process.env.NODE_ENV !== 'production') {
    defineReactive(
      vm,
      '$attrs',
      (parentData && parentData.attrs) || emptyObject,
      () => {
        !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm);
      },
      true
    );
    defineReactive(
      vm,
      '$listeners',
      options._parentListeners || emptyObject,
      () => {
        !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm);
      },
      true
    );
  } else {
    defineReactive(
      vm,
      '$attrs',
      (parentData && parentData.attrs) || emptyObject,
      null,
      true
    );
    defineReactive(
      vm,
      '$listeners',
      options._parentListeners || emptyObject,
      null,
      true
    );
  }
}
```

10. 生命周期钩子函数执行
11. injections 和 provide 非响应式数据初始化与传递
12. 实例的 state 初始化

```js
export function initState(vm: Component) {
  vm._watchers = [];
  const opts = vm.$options;
  if (opts.props) initProps(vm, opts.props);
  if (opts.methods) initMethods(vm, opts.methods);
  if (opts.data) {
    initData(vm);
  } else {
    observe((vm._data = {}), true /* asRootData */);
  }
  if (opts.computed) initComputed(vm, opts.computed);
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}
```

13. 对 html 跟节点进行相关的视图操作，`$mount` 的实现与项目打包的版本有关。以`entry-runtime-with-compiler`版本为例，自定义的 `render` 是最优先执行，其次是`template`属性配置，最后是 `el` 上取出的模板当做`template`的值。

`template`最终通过`compileToFunctions`的方法转换为 `render`。在`runtime`版本中，`template`已经预先打包转化为`render`函数，故在`runtime`版本中不需要
`compiler`

此处涉及的编译具体实现暂且略过略过。
```js
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function(
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el);

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' &&
      warn(
        `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
      );
    return this;
  }

  const options = this.$options;
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template;
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template);
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            );
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML;
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this);
        }
        return this;
      }
    } else if (el) {
      template = getOuterHTML(el);
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile');
      }

      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          outputSourceRange: process.env.NODE_ENV !== 'production',
          shouldDecodeNewlines,
          shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments,
        },
        this
      );
      options.render = render;
      options.staticRenderFns = staticRenderFns;

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end');
        measure(`vue ${this._name} compile`, 'compile', 'compile end');
      }
    }
  }
  return mount.call(this, el, hydrating);
};
```
PS:该 `$mount`进行了覆盖，而将原本的原型函数 `$mount` 传递给 `mount` 变量。而原先的函数功能为渲染组件。相关渲染功能此处暂且略过。

```js
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```

#### stateMixin

`src/core/instance/state.js`
```js
export function stateMixin (Vue: Class<Component>) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  const dataDef = {}
  dataDef.get = function () { return this._data }
  const propsDef = {}
  propsDef.get = function () { return this._props }
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function () {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)

  Vue.prototype.$set = set
  Vue.prototype.$delete = del

  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    const vm: Component = this
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    options.user = true
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
      try {
        cb.call(vm, watcher.value)
      } catch (error) {
        handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`)
      }
    }
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}
```
1. 定义实例上的 `$data` 和 `$props`
2. 挂载 `$set` 、`$delete` 和 `$watch` 原型方法

#### eventsMixin
`src/core/instance/events.js`

```js
export function eventsMixin (Vue: Class<Component>) {
  const hookRE = /^hook:/
  Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
    const vm: Component = this
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn)
      }
    } else {
      (vm._events[event] || (vm._events[event] = [])).push(fn)
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        vm._hasHookEvent = true
      }
    }
    return vm
  }

  Vue.prototype.$once = function (event: string, fn: Function): Component {
    const vm: Component = this
    function on () {
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }
    on.fn = fn
    vm.$on(event, on)
    return vm
  }

  Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {
    const vm: Component = this
    // all
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }
    // array of events
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$off(event[i], fn)
      }
      return vm
    }
    // specific event
    const cbs = vm._events[event]
    if (!cbs) {
      return vm
    }
    if (!fn) {
      vm._events[event] = null
      return vm
    }
    // specific handler
    let cb
    let i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1)
        break
      }
    }
    return vm
  }

  Vue.prototype.$emit = function (event: string): Component {
    const vm: Component = this
    if (process.env.NODE_ENV !== 'production') {
      const lowerCaseEvent = event.toLowerCase()
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          `Event "${lowerCaseEvent}" is emitted in component ` +
          `${formatComponentName(vm)} but the handler is registered for "${event}". ` +
          `Note that HTML attributes are case-insensitive and you cannot use ` +
          `v-on to listen to camelCase events when using in-DOM templates. ` +
          `You should probably use "${hyphenate(event)}" instead of "${event}".`
        )
      }
    }
    let cbs = vm._events[event]
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      const args = toArray(arguments, 1)
      const info = `event handler for "${event}"`
      for (let i = 0, l = cbs.length; i < l; i++) {
        invokeWithErrorHandling(cbs[i], vm, args, vm, info)
      }
    }
    return vm
  }
}
```

1. 挂载事件相关的 `$on` 、`$once` 、`$off` 和 `$emit` 原型方法
2. 事件中存在生命周期函数相关事件则 `_hasHookEvent` 为 `true`

#### lifecycleMixin

`src/core/instance/lifecycle.js`

```js
export function lifecycleMixin (Vue: Class<Component>) {
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    const restoreActiveInstance = setActiveInstance(vm)
    vm._vnode = vnode
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    restoreActiveInstance()
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  }

  Vue.prototype.$forceUpdate = function () {
    const vm: Component = this
    if (vm._watcher) {
      vm._watcher.update()
    }
  }

  Vue.prototype.$destroy = function () {
    const vm: Component = this
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy')
    vm._isBeingDestroyed = true
    // remove self from parent
    const parent = vm.$parent
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm)
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown()
    }
    let i = vm._watchers.length
    while (i--) {
      vm._watchers[i].teardown()
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--
    }
    // call the last hook...
    vm._isDestroyed = true
    // invoke destroy hooks on current rendered tree
    vm.__patch__(vm._vnode, null)
    // fire destroyed hook
    callHook(vm, 'destroyed')
    // turn off all instance listeners.
    vm.$off()
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null
    }
    // release circular reference (#6759)
    if (vm.$vnode) {
      vm.$vnode.parent = null
    }
  }
}
```
1. 挂载 `_update` 原型函数，其中 `__patch__`函数实现解耦，在不同平台有不同的实现。实际的vdom比对和更新挂载即在`__patch__`函数中执行。`_update`在 `mountComponent` 函数中执行。
2. 挂载 `$forceUpdate` 和 `$destroy` 原型函数


#### renderMixin

`src/core/instance/render.js`

```js
export function renderMixin (Vue: Class<Component>) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype)

  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }

  Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options

    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      )
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
      // There's no need to maintain a stack because all render fns are called
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      currentRenderingInstance = vm
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      handleError(e, vm, `render`)
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production' && vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
        } catch (e) {
          handleError(e, vm, `renderError`)
          vnode = vm._vnode
        }
      } else {
        vnode = vm._vnode
      }
    } finally {
      currentRenderingInstance = null
    }
    // if the returned array contains only a single node, allow it
    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0]
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
      vnode = createEmptyVNode()
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
  }
}
```
1. `installRenderHelpers` 函数中给予原型挂载构造不同类型 vnode 的函数。 
2. 挂载 `_render` 可执行 `render` 函数返回 `vnode`，并为其绑定父组件的 `_parentVnode`
3. 挂载 `$nextTick` 原型方法

#### 流程回归

由于 Vue 的原型方法和各种属性标签在 new Vue() 调用前已经完成初始化。实例生成后的执行顺序与上文写作不同。(下例以 `entry-runtime-with-compiler` 版本为例)
```
new Vue({})
  ├──执行 init
      ├──合并构造函数 option 
      ├──初始化根节点生命周期与vnode相关标记
      ├──执行生命周期函数 beforeCreate
      ├──初始化 state ，相关代理与响应式监听
      ├──初始化 provide
      ├──执行生命周期函数 created
  ├──执行 $mount
  ├──将 template 转换为 render
  ├──执行 mountComponent
      ├──执行生命周期函数 beforeMount
      ├──执行 _render
          ├── 执行 render.call(vm._renderProxy, vm.$createElement)

```