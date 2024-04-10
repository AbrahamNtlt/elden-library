### 3.打包流程


#### 打包工作流程

1. 初始化参数:  
   合并 配置文件和 shell 语句中合并参数

   - 用户在打工工程文件的时候,初始都是 nodejs 工程的脚本,如:webpack 或 webpack --config webpack.config.js --mode development 等
   - 从 npm 中查找相关命令,执行实际为 node_modules/webpack/bin/webpack.js 文件.webpack.js 脚本文件将会根据工程配置,依赖于 webpack-cli 或 webpack-command 执行命令,核心代码:
     ```js
     runCommand(packageManager, installOptions.concat(packageName));
     ```
   - 以 webpack-cli 为例,执行 node_modules/webpack-cli/bin/cli.js,在此文件中可看见核心代码:

     ```js
     compiler = webpack(options);
     //初始化compiler 根据各种情况判断后执行run
     compiler.run((err, stats) => {
       if (compiler.close) {
         compiler.close((err2) => {
           compilerCallback(err || err2, stats);
         });
       } else {
         compilerCallback(err, stats);
       }
     });
     ```

2. 开始编译 :
   通过具体参数初始化 Compiler 对象,
   执行 Compiler 的相关声明周期钩子(执行插件)
   加载所有配置的插件..执行对象的 run 方法执行编译.
   确定入口
   webpack.js 与 compiler.js 代码结构

   ```js
   const webpack = (options, callback) => {
     let compiler;
     options = new WebpackOptionsDefaulter().process(options);
     new NodeEnvironmentPlugin({
       infrastructureLogging: options.infrastructureLogging,
     }).apply(compiler);
     if (options.plugins && Array.isArray(options.plugins)) {
       for (const plugin of options.plugins) {
         if (typeof plugin === 'function') {
           plugin.call(compiler, compiler);
         } else {
           plugin.apply(compiler);
         }
       }
     }
     compiler.hooks.environment.call();
     compiler.hooks.afterEnvironment.call();
     compiler.options = new WebpackOptionsApply().process(options, compiler);
     return compiler;
   };
   ```

   webpack 可视为 Compiler 的工厂函数,Compiler 为实际核心工作的调度类:

   ```js
   class Compiler extends Tapable {
     constructor(context) {
       this.hooks = {
         shouldEmit: new SyncBailHook(['compilation']),
         done: new AsyncSeriesHook(['stats']),
         run: new AsyncSeriesHook(['compiler']),
         //此处略去...等定义各种生命周期
       };
       //此处略去...各种初始化定义
     }
     run(callback) {
       //此处略去...代码执行中各种判断,只介绍核心调用
       this.hooks.beforeRun.callAsync(this, (err) => {});
     }
     compile(callback) {
       const params = this.newCompilationParams();
       this.hooks.beforeCompile.callAsync(params, (err) => {
         if (err) return callback(err);
         this.hooks.compile.call(params);
         const compilation = this.newCompilation(params);
         this.hooks.make.callAsync(compilation, (err) => {
           if (err) return callback(err);
           compilation.finish((err) => {
             if (err) return callback(err);
             compilation.seal((err) => {
               if (err) return callback(err);
               this.hooks.afterCompile.callAsync(compilation, (err) => {
                 if (err) return callback(err);
                 return callback(null, compilation);
               });
             });
           });
         });
       });
     }
     // 此处略去...watch 等其他方法定义
   }
   ```

3) 模块分析
   从入口文件,调用配置的 loader 进行编译,找出模块的依赖模块,重复此步骤
   文件通过 `@babel/parse` 转换为 `ast`
   通过 `@babel/traverse` 遍历 `ast` 中所有的依赖
   通过 `@babel/core` (实际是 `@babel/preset-env` )将 ast 转换为相应浏览器兼容代码;
   若依赖的模块中有其他依赖,递归循环次过程(PS:webpack 对循环依赖应用的处理方法取决于源码中使用的是 `commonjs` 还是 `es module`)

4)完成编译
翻译模块得到最终内容,分析模块之间的依赖关系,根据依赖关系组成相应的 chunk,再把 chunk 加入输出列表

5)输出内容
根据确定好的输出内容,写入文件系统,得到打包后的静态文件