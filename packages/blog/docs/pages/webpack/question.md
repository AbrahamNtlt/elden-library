#### loader / plugin 有什么不同

loader 加载各种静态资源,并将转为目标模块

plugin 为插件,为 webpack 扩展更多功能. 在 webpack 运行的声明周期中,监听各种事件,再通过 webpack 提供的 api 改变输出结果

#### 如何调试 webpack

通过 nodejs 脚本的形式... 在脚本中进行打打断点

```js
const webpack = require('webpack');
const config = require('./webpack.config.js');
debugger;
const compiler = webpack(config);
function compilerCallback(err, stats) {
  const statsString = stats.toString();
  console.log(statsString);
}
compiler.run((err, stats) => {
  compilerCallback(err, stats);7
});
```

#### webpack 是如何区分 各种js 模块化

#### 哪些常见的 loader 和 plugin

webpack 前端性能优化

1. 压缩 js / css /图片
2. 清除无用 css
3. treeShaking
4. scope hoisting
5. 代码分割
  - 入口分割
  - 动态加载
  - preload 预先加载  页面关键资源,资源下载优先权重高 ,资源加载权重的5个级别  highest  high medium low lowest
  - prefetch 预先拉取  浏览器闲事加载的资源..用于可能用到,但目前暂时不需要的资源..比如懒加载时,提前加载了所需文件.
  - 提取公用代码
  - splitChunks

cdn 使用


提取公共代码

cdn

拉钩教育 webpack课程的笔记:

1. webpack解决了什么问题:
更高效的维护和管理前端项目的资源:
- 处理了各种兼容问题,比如es6到es5
- 处理资源文件,包括文件压缩/整合/拆分
- 各种文件文件格式转换,比如各种模块化,甚至css的模块化,预编译语言 ts/less等,,为各种资源提供了统一管理方法



2.配置支持智能提醒:
// ./webpack.config.js
import { Configuration } from 'webpack'

但是实际运行的时候必须取消掉,可以使用下面方式:
// ./webpack.config.js
/** @type {import('webpack').Configuration} */
const config = {

}
module.exports = config


3. 新增了工作模式: 
- production 模式下，启动内置优化插件，自动优化打包结果，打包速度偏慢；
- development 模式下，自动优化打包速度，添加一些调试过程中的辅助插件；
- none 模式下，运行最原始的打包，不做任何额外处理。

4. 打包结果分析

5. loader 的加载机制,如何手写loader


6. plugin 
7. 核心工作原理(流程)
- Webpack CLI 启动打包流程；
- 载入 Webpack 核心模块，创建 Compiler 对象；
- 使用 Compiler 对象开始编译整个项目；
- 从入口文件开始，解析模块依赖，形成依赖关系树；
- 递归依赖树，将每个模块交给对应的 Loader 处理；
- 合并 Loader 处理完的结果，将打包结果输出到 dist 目录。


8. make 阶段
SingleEntryPlugin 中调用了 Compilation 对象的 addEntry 方法，开始解析入口；
addEntry 方法中又调用了 _addModuleChain 方法，将入口模块添加到模块依赖列表中；
紧接着通过 Compilation 对象的 buildModule 方法进行模块构建；
buildModule 方法中执行具体的 Loader，处理特殊资源加载；
build 完成过后，通过 acorn 库生成模块代码的 AST 语法树；
根据语法树分析这个模块是否还有依赖的模块，如果有则继续循环 build 每个依赖；
所有依赖解析完成，build 阶段结束；
最后合并生成需要输出的 bundle.js 写入 dist 目录。





