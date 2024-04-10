### 文档对象模型 ( Document Object Model )

`DOM` 是由 `W3C` 制定，定义了如何访问 `HTML` 和 `XML`文档的标准。<br>
`DOM` 是独立于平台与语言的接口，允许程序和脚本动态的获取更新文档的内容、结构与样式。<br>

#### DOM 级别 ( 发展历史 )

DOM 0 级：实际不存在，指代 `Netscape Navigator 4` 及 `IE4` 所实现的 `DHTML` 技术。 ( Dynamic HTML，即由 `html`、`javascript`、`css` 所组成的动态页面技术 )<br>

DOM 1 级：定义了底层结构。<br>

- `DOM Core` 规定如何映射基于 `xtml` 的文档结构。<br>
- `DOM HTML` 规定针对 `html` 的对象和方法的扩展。<br>

DOM 2 级：在 `DOM 1` 基础上引入更多交互，支持更多 `XML` 的高级特性。<br>

- `DOM Views` 定义跟踪不同文档视图的接口，主要是两个接口 - `AbstractView` 与 `DocumentView`。<br>
- `DOM Events` 定义了事件和相关处理接口。<br>
- `DOM Style` 定义了基于 `css` 的样式处理接口。<br>
- `DOM Traversal and Range` 定义了遍历和操作文档树的接口。<br>

DOM 3 级：在 `DOM 2` 基础上增加更多 API 。新增加载保存模块与验证模块。<br>

- `DOM Load and Save` 引入统一方式加载和保存文档的方法。<br>
- `DOM Validation` 定义了验证文档的方法。<br>

#### 文档类型

- `GML` ( Generalized Markup Language ) 通用标记语言，用于描述文档的组织结构、各部件及其相互关系。<br>
- `SGML` ( Standard Generalized Markup Language ) 标准通用标记语言，是可以定义标记语言的元语言， `HTML` 和 `XML` 同样衍生于 `SGML` ，由于太复杂而难以普及。<br>
- `HTML` ( HyperText Markup Language ) 超文本标记语言，网页创建和其它可在网页浏览器中看到的信息所设计的一种标记语言。<br>
- `XML` ( eXtensible Markup Language ) 可扩展标记语言，规则严谨但是简单描述数据的语言。<br>
- `XHTML` ( eXtensible HyperText Markup Language ) 可扩展超文本标记语言，在 `HTML` 基础上规则更严谨的语言。<br>

#### 节点类型

| 节点类型                       | 数值常量 | 字符常量               | nodeName           | nodeValue    | 描述                                                                                   |
| ------------------------------ | -------- | ---------------------- | ------------------ | ------------ | -------------------------------------------------------------------------------------- |
| Element(元素节点)              | 1        | ELEMENT_NODE           | 元素标签名         | null         | 用于描述 html 与 xml 元素                                                              |
| Attr(属性节点)                 | 2        | ATTRIBUTE_NODE         | 属性名             | 属性值       | 描述元素的属性，视为元素的一部分而不单独属于文档树的一部分                             |
| Text(文本节点)                 | 3        | TEXT_NODE              | #text              | 节点文本内容 | 只包含文本内容，文档中的空格部分也属于文本节点                                         |
| Comment(注释节点)              | 8        | COMMENT_NODE           | #comment           | 注释内容     | 表示注释的内容                                                                         |
| Document(文档节点)             | 9        | DOCUMENT_NODE          | -                  | -            | 文档树根节点，但非文档的根元素，由于文档可以进行嵌套，根节点也可以是其他文档树的子节点 |
| DocumentType(文档类型节点)     | 10       | DOCUMENT_TYPE_NODE     | doctype 的名称     | null         | 文档顶部声明的 `doctype` ， 其值或是 `null` ，或者是 `DocumentType` 对象               |
| DocumentFragment(文档片段节点) | 11       | DOCUMENT_FRAGMENT_NODE | #document-fragment | null         | 是轻量级的或最小的 `Document` 对象，不属于文档树 ，但可以通过 API 将子孙节点插入文档树 |

#### window.onload

`html` 是一种标记语言，浏览器引擎将文档解析渲染为可交互的 `DOM` 存在一个构件过程，文档树构建完毕成为 `domReady` 。<br>
`onload` 当元素在加载完毕后执行。但 `window.onload` 的在页面资源加载中可能存在一些网络请求导致该事件触发时间比较长。

#### DOMContentLoaded

`window.onload` 存在资源加载的时间长度问题，而 `DOMContentLoaded` 则 `DOM` 加载完成即触发，不需要等待图片、flash、脚本等替换元素的加载。<br>
`DOMContentLoaded` 在开发中的许多场景都更为实用，但低版本浏览器存在兼容问题。

#### DOM 的继承

当使用 `document.createElement("p")` 来创建一个 `p` 节点的时候，实际是 `HTMLParagraphElement`的实例。<br>
而 `HTMLParagraphElement` 的父类是 `HTMLElement` ，<br>`HTMLElement` 的父类是 `Element` ，<br>`Element` 的父类是 `Node`，<br>`Node` 的父类是 `EventTarget`，<br>`EventTarget`的父类是`Function`，<br>`Function` 的父类是 `Object`。<br>

当使用 `document.createTextNode("xxx")`创建文本节点，其实 `document.createTextNode("xxx")` 是 `Text` 的一个实例。<br>而 `Text` 的父类是 `CharactorData` ，<br>`CharactorData` 的父类是 `Node`。

`DOM` 上有非常多的属性，其操作的性能消耗是巨大的。在开发过程中应尽量少操作 `DOM` ，现今流行的数据驱动视图的框架能很好的规避许多无效 `DOM` 操作。<br>

#### DOM 操作 api

1. 节点创建：

- `createElement` ：创建元素节点
- `createTextNode` ：创建文本节点
- `createAttribute` ：创建属性节点
- `cloneNode` ：克隆节点
- `createDocumentFragment` ：创建节点片段

2. 元素查询：

- `getElementById`：根据 id 查询
- `getElementsByTagName` ：根据 tag 查询
- `getElementsByName` ：根据 name 查询
- `getElementsByClassName` ：根据 class 查询
- `querySelector` ：根据 选择器 查询，返回单个元素
- `querySelectorAll` ：根据 选择器 查询，返回数组

3.  节点操作：

- `appendChild` ： 当前节点往前插入节点
- `insertBefore`当前节点往后插入节点
- `removeChild` ：删除子节点
- `replaceChild` ：替换子节点
- `firstChild` ：返回当前节点的第一个子节点
- `lastChild` ：返回当前节点的最后一个子节点
- `childNodes` ：返回当前节点的子节点数组
- `previousSibling` ：返回当前节点的前一个节点
- `nextSibling` ：返回当前节点的后一个节点
- `parentNode` ：返回当前节点的父节点

4. 属性操作：

- `createAttribute` ：创建属性
- `setAttribute` ：设置属性
- `removeAttribute` ：删除属性
- `getAttribute` ：获取属性

5. 文本操作：

- `insertData` ：从指定位置插入文本
- `appendData` ：末尾插入文本
- `deleteData` ：从指定位置删除指定文本字符
- `replaceData` ：从指定位置替换指定文本字符
- `splitData` ：从指定位置分成两个节点
- `substring` ：返回指定位置指定数量字符
- `innerText`：子节点替换为指定文本
- `innerHTML` ：子节点替换为指元素

#### DOM 事件

事件是用户与页面交互或者程序运行到某些特定情况时所发生的，程序将自动运行的一些任务。<br>
`DOM 0` 时，事件直接绑定在元素上，且类型有限。<br>
```js
dom.onClick = function(){}
```
`DOM 2` 增加了事件监听器，使事件可以写脚本中。<br>
```js
dom.addEventListner('eventType',callback,(boolean | option))
dom.removeEventListner('eventType',callback)
```
`DOM 3` 中扩展更多的事件类型。<br>

事件类型分为 `冒泡` 和 `捕获`。<br>

冒泡：时间从嵌套层级最深的元素接收，逐级向上传播到最上级文档节点。<br>
捕获：与冒泡相反，从最上级元素开始接收，逐级向下传播到嵌套层级最深的元素。<br>

Tips：事件委托即是利用事件冒泡机制的一种开发技巧。<br>

#### DOM 事件流

事件流是描述事件在页面中的完整的接收顺序，分为三个阶段：
1. 捕获阶段，从 `window` 开始逐级向下到目标元素
2. 当前目标阶段
3. 冒泡阶段，从目标元素逐级向上到 `window`

#### 事件对象

事件对象 `Event` 是事件的回调函数以形参的方式与其绑定一起的内置对象，常见的方法操作：

- `target`：返回触发事件的元素。（不一定是绑定事件的元素，如事件委托）
- `currentTarget`：返回绑定事件的元素。
- `type` ：返回事件的类型。
- `preventDefault` ：阻止默认行为。
- `stopPropagation` ：停止事件传播。
