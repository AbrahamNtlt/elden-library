
#### 响应式数据的理解



Object.def =>

#### 监听数组变化


数组原型上的方法进行拦截  7个方法 push shift pop splice unshift sort  reverse


#### vue.set
数组->调用 splice 方法
对象  -> 原先有响应式属性,直接赋值
     -> 原先没有响应式属性,对象本身是响应式数据 defineReactive ,并手动通知视图更新
    -> 原先没有响应式属性,对象本身也不是响应式数据 直接赋值,不需要将其改为响应式
#### 模板编译原理
vue-template-compiler
const { ast , render } = VueTemplateCompiler.compiler(`template`)

1. template 转换为 ast 语法树   parserHtml
正则匹配标签属性和自定义指令 

const ast = parse(template.trim(),options)

2. 对静态节点进行标记  markup

optimize(ast,options)

3. 重新生成代码 codeGen

const code = generate(ast,options)




return { ast , render: code.render, staticRenderFns: code.staticRenderFns }


最后生成的是函数的字符串(render)  => new Function 和 with 作用域

#### 生命周期钩子怎么实现

生命周期钩子本质是一个个函数

当vm实例创建时会先合并配置 mergeOptions
mergeOptions 会合并各种钩子配置,将一个个钩子函数以数组的形式组合一起
当程序运行到了特定的节点将执行特定的钩子 callHook(vm,hookName)


```js
function Vue(options){
  this.options = mergeOptions(this.constructor.options, options)
}

```

#### mixins 场景和原理

场景:抽取公用配置和属性,其原理就像对象的继承,当vm调用 mergeOptions 进行options的合并,每个vm组件合并后的实例是单独不共性的


缺点: 命名冲突,依赖问题,数据来源问题


#### nextTick 原理
nextTick 是下次dom更新结束后执行的延迟回调.原理就是一个异步方法
兼容方案 : promise -> mutationBoserver  -> setImmediate -> setTimeout 利用事件循环更新

每一次响应式数据更新都有可能更新视图. vue通过批量任务的方式处理,先处理数据更新,最后处理视图更新.  nextTick的作用即是将回调函数到下一轮任务队列中执行


#### 为什么需要vdom

dom操作的性能消耗是巨大的
而vdom(用js 对象描述真实dom)的比对计算相对于dom操作的性能开销小很多. 通过比对后找出最小差异单元再进行dom操作
使用vdom 也可以抽象出视图渲染.达到跨平台的效果

#### vue 中的diff算法
平级比较,不考虑跨级比较的情况,,,内部采用深度递归的方式 + 双指针的方式比对

1. 先比对是否相同节点 tag 和 key
2. 相同节点比对属性,并复用老节点
3. 比对子节点,,考虑老街店和新节点子节点情况
4. 优化比对..头头,尾尾,头尾,尾头
5. 比对查找进行复用


vue3 才用递增子序列实现


#### 生命周期有哪些..一般哪一部请求 



#### vue组件传值方式
1. props + emit 父子组件传值
2. $parent,$children 或$refs 获取对应组件
3. $attrs 和 $listeners
4. provide 和 inject 
5. vuebus  $on
6. vuex


#### vue组件渲染流程

创建 先父后子...

卸载 先子后父

new Vue()  or Vue.extends().$mount()

init() -> 返回子组件实例  createCompontInstanceForVnode  -> $mount


#### vue 中的data为什么是一个函数
不同vm  引用相同data可能互相影响

#### v-if和v-show
v-if 不是指令 最终编译转换为一个三元表达式
v-show是一个指令 display:none 为dom.style 操作



####  Vue.use 作用与原理

使用第三方插件扩展

Vue.use(plugin,args)
当 plugin 为函数 -> plugin.apply(null,args)
当 plugin 为对象 -> plugin.install.apply(plugin,args)

plugin函数的第一个参数是vue形参.. 如:  Vuex.install = function(_Vue,a,b,c){}


#### v-router 守卫 和 两种模式

#### 组件的name 有什么作用

1. 通过name找到组件对应组件(递归组件 / 跨级组件通信)
2. 通过name属性缓存组价(keep-alive)


#### 事件修饰符原理
不太懂-- 标星~


#### vue 自定义指令实现

编译原理 -> 代码生成 -> 指令钩子

1. 生成 ast 语法树 当遇到当前元素的时候添加directives属性

addDirective{}  添加相应的对象

2. 通过 genDirectives 生成指令代码

生成 : direstives:[] 代码块

3. 在 path 前将 patch 前指令钩子提取到 cbs 中, 在patch过程中调用对应的钩子
钩子如: create activate update remove destroy

4. 当执行指令对应钩子函数时, 调用对应指令定义方法


#### vuex 相关
1.   在全局创建了一个 new Vue实例 用于多组件中数据共享.数据缓存
2.  action(支持异步) 和 mutation(只能同步,更新state)
3. replaceState   subscribe  registerModule  namespace(modules) ->



#### slot 如何实现
除了默认插槽..都通过 (通过vnode)父组件的slot 和子组件的 name 来匹配 

普通(默认)插槽 / 命名插槽 -> 父组件中渲染 -> 用父组件的数据

以子节点的方式 通过组件通信 替换到子组件中



作用域插槽 -> 子组件中渲染 ->  用子组件的数据
作为属性参数以一个函数的方式传入子组件..子组件为上下文调用父组件传递的函数.进行渲染.然后替换



#### keep-alive 原理
用于做缓存  才用LRU算法,最近最久未使用法

存储缓存队列 (存储单元是vnode)   其中 cache => { key: vnode}  keys=[]  

当最近使用的组件放最后,最久放最前..当有新组件加入时.删除最久.添加最新 ,,,更换keys的顺序..,新增和删除时操作 cache

在相应的vnode.data.keeAlive  做一个true 标记  (有该标记的时候..组件不需要执行$mount() 方法..直接调用patch)

该组件返回的 vnode 为组件下的第一个子节点