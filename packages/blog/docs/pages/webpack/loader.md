### 5. Loader

在 webpack 的思想中,一切资源皆模块.webpack 本身默认可加载 js 和 json ,在 web 工程中的静态文件还有 HTML, js, css ,字体,图片等资源.loader 赋予了 js 引用这些资源的能力.

```js
import './index.css';
```

该语句实际是说明 js 与 css 之间存在依赖关系,实际打包输出结果还是将 css 作为单独的资源,以 html 的标签形式引入.
在没有相关的 loader 的配置情况下将出现语法错误.
loader 是属于 webpack 工程的一环, loader 中对预编译语言的处理依旧需要安装相应的转换器,如: scss-loader 需要安装 node-sass ,babel-loader 需要安装 babel/core

#### loader 的配置

1. 基本配置

   ```js
   rules: [
     {
       test: /\.css$/,
       use: [
         'style-loader',
         {
           loader: 'css-loader',
           option: {
             module: true,
             //.....
           },
         },
       ],
     },
   ];
   ```

在配置文件的 `rules` 以数组单元形式配置,
test 为模块的正则表达式匹配
use 数组形式配置 loader,loader 加载顺序由后往前,
`option`部分与`loader`自身有关

2.  exclude 与 include

        ```js
        rules:[
          {
            test:/\.js$/
            use:['babel-loader'],
            exclude:/node_modules/,
            include:/src/
          }
        ]
        ```

    include 即为指定包含的资源
    exclude 即为不包含的资源, 优先级高 , 当 include 与 exclude 有交叉时, exclude 生效。

3.  resource 与 issuer

    在 webpack 中 resource 为被加载的资源模块,issuer 为加载者

    ```js
    rules:[
      {
        test:/\.css$/,
        use:['style-loader','css-loader'],
        resource:{
          test:/\.js$/.
          include:/src/
        },
        issuer:{
          test:/\.css$/,
        }
      }
    ]
    ```

    增加两者的配置使得配置更加细化

4.  enforce
    在 webpack 的 loader 按照执行顺序分类四类:

    - pre 最先执行
    - normal 没有特殊配置的普通 loader
    - inline 打包单文件的 loader, 与配置文件中对一类文件处理的形式不同,与现已不推荐
      ```js
      //inline loader
      import data from 'raw-loader!../utils.js';
      ```
    - post 最后执行

    enforce 只接收 pre 和 post

    ```js
    //eslint-loader 为语法检查,必须在其余loader将其代码转换之前执行
    rules: [
      {
        test: /\.js$/,
        use: ['eslint-loader'],
        enforce: 'pre',
      },
    ];
    ```

    PS: 以上 loader 的加载顺序为 webpack 的 normal 阶段,而 Patching 阶段的顺序为:post，inline，normal，pre

5.  noParse
    忽略某些不需要接续处理的模块文件,提高构建效率
    ```js
    noParse: /jquery|charts/;
    ```
6.  paser
    对模块化规范进行细化配置
    ```js
    rules:[
      {
        test:/\.js$/,
        parser:[
          amd:false,          //禁用amd
          commonjs:false,     //禁用commonjs
          requireJs:false,    //禁用requireJs
          ...
        ]
      }
    ]
    ```

#### 常见 loader

| loader            | 用途                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------- |
| babel-loader      | 转化 es6 代码到指定版本                                                                |
| ts-loader         | Typescript 语言转换                                                                    |
| html-loader       | 将 HTML 文件转化为字符串                                                               |
| handlebars-loader | 处理 handlebars 模板                                                                   |
| file-loader       | 图片等文件资源打包                                                                     |
| url-loader        | 与 file-loader 功能类似,增加了 limit 配置,根据模块文件大小选择打包文件或者 base64 编码 |
| style-loader      | 把 css 注入 script 中,通过 dom 加载 css                                                |
| css-loader        | 加载 css,模块化,压缩文件导入等特性                                                     |
| scss-loader       | 把 sass /scss 文件生成 css                                                             |
| eslint-loader     | 用 eslint 检查代码                                                                     |
| postcss-loader    | 使用 postcss 处理 css                                                                  |
| vue-loader        | vue 文件转换编译成处理                                                                 |

#### file-loader

url-loader

css 相关

style-loader 将 css 挂在页面中
css-loader 关联 css 文件引用关系.生成完整的生成完整的 css 文件

预处理器 sass-loader 解析预编译文件语法
postcss-loader 做 css 的前缀及兼容优化

#### 手写 loader

loader 的本质是一个函数,将模块内容输入,解析处理后再导出,多个 loader 形成一个链式.

```
use:['style-loader','css-loader','scss-loader']
=>  style-loader(css-loader(cscs-loader( scss)))
```

一下是 loader 的源码结构

```js
module.exports = function loader(content,map,meta) {
  var callback = this.async()
  var result = handler(content,map,meta)
  callback({
    null,             //error
    result.content,   //转换后内容
    result.map,       //转换后 souce-map
    result.meta       //转换后 ast
  })

}
```

loader 的分类:

post - 后置 enforce
inline 内联
normal 正常
pre 前置   enforce

loader 的执行顺序:

pre =>  normal  => inline => post


特殊配置
! noAutoLoader 不要普通 loader
-! noPreAutoLoader 不要前置和普通 loader
!! noPrePostAutoLoaders 不要前置和普通 loader,只要内联 loader


loader的组成部分:
pitch: 先执行的函数,如果有返回值则阻断返回上一部

post.pitch  =>  inline.pitch => normal.pitch  => pre.pitch


normal: 正常转换的函数

例子:
use:[loader1,loader2,loader3]


loader1.pitch -> loader2.pitch -> loader3.pitch -> source -> loader3 -> loader2 ->loader1

