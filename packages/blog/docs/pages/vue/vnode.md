#### Virual DOM

`Virual DOM` 也称 虚拟 DOM 是用 JS 对象描述真实 `DOM` 的一种数据结构

`Vdom` 并非 MVVM 框架所必须的，MVVM 模型解决了数据 state 与 视图 view 的同步问题，减少手动操作 dom，从开发与项目管理的角度看减少了代码的冗余。
而引入 `Vdom` 则是优化了代码执行时性能，由于真实 dom 的性能开销是相当昂贵的， 通过新旧 `Vdom`的比对可找出最少操作 `dom` 的方案。

依 vue 的情况而言，每一个被收集依赖的响应式数据对都对应了 `render-watcher` 来响应视图变化。若令每一个属性都各自存在与之完全对应的单独 `watcher` ，则对于大型项目的性能开销是相当大的。
引入了 `Vdom` 后可以将 `render-watcher` 以组件为单位与数据对应。

##### VNode 节点

`src/core/vdom/vnode.js`

```js
/* @flow */
export default class VNode {
  tag: string | void;
  data: VNodeData | void;
  children: ?Array<VNode>;
  text: string | void;
  elm: Node | void;
  ns: string | void;
  context: Component | void; // rendered in this component's scope
  key: string | number | void;
  componentOptions: VNodeComponentOptions | void;
  componentInstance: Component | void; // component instance
  parent: VNode | void; // component placeholder node

  // strictly internal
  raw: boolean; // contains raw HTML? (server only)
  isStatic: boolean; // hoisted static node
  isRootInsert: boolean; // necessary for enter transition check
  isComment: boolean; // empty comment placeholder?
  isCloned: boolean; // is a cloned node?
  isOnce: boolean; // is a v-once node?
  asyncFactory: Function | void; // async component factory function
  asyncMeta: Object | void;
  isAsyncPlaceholder: boolean;
  ssrContext: Object | void;
  fnContext: Component | void; // real context vm for functional nodes
  fnOptions: ?ComponentOptions; // for SSR caching
  devtoolsMeta: ?Object; // used to store functional render context for devtools
  fnScopeId: ?string; // functional scope id support

  constructor(
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm;
    this.ns = undefined;
    this.context = context;
    this.fnContext = undefined;
    this.fnOptions = undefined;
    this.fnScopeId = undefined;
    this.key = data && data.key;
    this.componentOptions = componentOptions;
    this.componentInstance = undefined;
    this.parent = undefined;
    this.raw = false;
    this.isStatic = false;
    this.isRootInsert = true;
    this.isComment = false;
    this.isCloned = false;
    this.isOnce = false;
    this.asyncFactory = asyncFactory;
    this.asyncMeta = undefined;
    this.isAsyncPlaceholder = false;
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child(): Component | void {
    return this.componentInstance;
  }
}
```

| 属性              | 描述               |
| ----------------- | ------------------ |
| tag               | 标签名             |
| data              | 属性、事件等数据   |
| children          | 子节点             |
| text              | 文本节点内容       |
| elm               | 对应 dom 元素      |
| ns                | 命名空间           |
| context           | 当前组件的 vm 实例 |
| key               | key 标识           |
| componentOptions  | 组件的 option      |
| componentInstance | 组件实例           |
| parent            | 父节点             |

以上属性是用于 dom 渲染的属性，下为特殊功能优化与计算的标记属性

| 属性               | 描述                                        |
| ------------------ | ------------------------------------------- |
| raw                | 是否为原生 html 节点标识                    |
| isStatic           | 是否为静态节点标识                          |
| isRootInsert       | 是否为根节点插入标识                        |
| isComment          | 是否为注释节点                              |
| isCloned           | 是否为克隆节点                              |
| isOnce             | v-once 节点                                 |
| asyncFactory       | 异步组件工厂函数                            |
| asyncMeta          | 异步 Meta                                   |
| isAsyncPlaceholder | 是否异步占位符标识                          |
| ssrContext         | ssr 的上下文实例                            |
| fnContext          | functional 组件 vm 实例                     |
| fnOptions          | functional 组件 ssr 缓存                    |
| devtoolsMeta       | devtools 工具存储 functional 组件上下文对象 |
| fnScopeId          | functional 组件作用域 id                    |

#### 文本节点

```js
export function createTextVNode(val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val));
}

// => 例
{
  text: 'hello world';
}
```

单文本，只有 `text` 属性

#### 注释节点

```js
export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}
// 例  <!-- 注释 -->
//  =>
{
  text:'注释',
  isComment:true
}

```

`isComment` 为 `true`

#### 元素节点

```js
// <ul class="nav"><li>1</li><li>2</li></ul>
//   =>
{
  tag:'ul',
  data:{
    staticClass:"nav"
  },
  context:{...},
  childrern:[{
    tag:'li'
    data:{...},
    context:{...},
    childrern:[
      {
        text:'1'
      }
    ],
    // ...
  }
  ,...
  ]
}
```

#### 组件节点

```js
//  <clild /> =>
{
  tag:'vue-comppment-1-child',
  data:{...},
  context:{...},
  componentInstance:{...}
  componentOptions:{...}
}

```

多了 `componentOptions` 和 `componentInstance` 两个属性

#### 函数式节点

```js
{
  tag:'div',
  data:{...},
  context:{...},
  fnContext:{...}
  fnOptions:{...}
}
```

多了 `fnContext` 和 `fnOptions` 两个属性

#### 克隆节点

```js
export function cloneVNode(vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  );
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isComment = vnode.isComment;
  cloned.fnContext = vnode.fnContext;
  cloned.fnOptions = vnode.fnOptions;
  cloned.fnScopeId = vnode.fnScopeId;
  cloned.asyncMeta = vnode.asyncMeta;
  cloned.isCloned = true;
  return cloned;
}
```

克隆节点的 `isCloned` 为 `true` ，用于优化静态节点与插槽

#### VDOM 核心 API

`vue` 的引入 `vdom` 参考了流行库 [snabbdom](https://github.com/snabbdom/snabbdom)

| vue                 | snabbdom | 描述                              |
| ------------------- | -------- | --------------------------------- |
| createPatchFunction | init     | 加载模块创建 patch 函数的工厂函数 |
| h                   | h        | 生成 vnode 的函数                 |
| patch               | patch    | 比对新旧 vnode 和视图更新         |
